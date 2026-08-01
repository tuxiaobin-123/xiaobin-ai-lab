from __future__ import annotations

import asyncio
import threading
import time
from datetime import date, datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .ai import BAIAnalyst
from .alerts import AlertRouter
from .analytics import calculate_realtime_metrics
from .config import Settings, load_settings
from .events import EventEngine
from .financial_rules import evaluate_financial_rules
from .models import MarketEvent
from .providers import IFindHTTPProvider, MockProvider
from .seed import seed_from_csv
from .storage import Store


SHANGHAI = ZoneInfo("Asia/Shanghai")


def market_is_open(now: datetime | None = None) -> bool:
    current = (now or datetime.now(SHANGHAI)).astimezone(SHANGHAI)
    if current.weekday() >= 5:
        return False
    hhmm = current.hour * 100 + current.minute
    return 915 <= hhmm <= 1130 or 1300 <= hhmm <= 1500


class RuntimeController:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or load_settings()
        self.store = Store(self.settings.db_path)
        seed_from_csv(self.store, self.settings.root / "data" / "拓维信息_统一数据.csv")
        self.stop_event = threading.Event()
        self.announcement_sync_requested = threading.Event()
        self.financial_sync_requested = threading.Event()
        self.thread: threading.Thread | None = None
        self.status: dict[str, Any] = {
            "running": False,
            "provider": self.settings.data_mode,
            "last_tick": None,
            "last_error": None,
            "effective_poll_seconds": self.settings.quote_poll_seconds,
        }

    def start(self) -> "RuntimeController":
        if self.thread and self.thread.is_alive():
            return self
        self.thread = threading.Thread(target=self._thread_main, name="financial-lab-runtime", daemon=True)
        self.thread.start()
        return self

    def stop(self) -> None:
        self.stop_event.set()

    def request_announcement_sync(self) -> None:
        self.announcement_sync_requested.set()

    def request_financial_sync(self) -> None:
        self.financial_sync_requested.set()

    def _thread_main(self) -> None:
        asyncio.run(self._run())

    def _provider(self):
        if self.settings.data_mode == "ifind_http":
            return IFindHTTPProvider(self.settings)
        return MockProvider()

    async def _run(self) -> None:
        provider = self._provider()
        analyst = BAIAnalyst(self.settings)
        alerts = AlertRouter(self.settings)
        engine = EventEngine(self.settings, self.store)
        scheduler = AsyncIOScheduler(timezone="Asia/Shanghai")
        scheduler.add_job(self._sync_announcements, "interval", minutes=5, args=[provider, analyst, alerts], max_instances=1, coalesce=True)
        scheduler.add_job(self._sync_financials, "interval", minutes=30, args=[provider, analyst, alerts], max_instances=1, coalesce=True)
        scheduler.add_job(self.store.cleanup_quotes, "cron", hour=3, args=[self.settings.quote_retention_days])
        scheduler.start()
        self.status["running"] = True
        poll = self.settings.quote_poll_seconds
        try:
            while not self.stop_event.is_set():
                started = time.monotonic()
                if self.settings.data_mode != "mock" and self.settings.market_hours_only and not market_is_open():
                    await asyncio.sleep(15)
                    continue
                try:
                    quotes = await provider.get_quotes(self.settings.watch_symbols)
                    self.store.insert_quotes(quotes)
                    self.status.update({"last_tick": datetime.now(SHANGHAI).isoformat(), "last_error": None})
                    poll = self.settings.quote_poll_seconds
                    for symbol in {q.symbol for q in quotes}:
                        frame = self.store.recent_quotes(symbol, minutes=10, limit=900)
                        metrics = calculate_realtime_metrics(frame)
                        for event in engine.evaluate(metrics):
                            if self.store.insert_event(event):
                                await self._process_event(event, analyst, alerts)
                    if self.announcement_sync_requested.is_set():
                        self.announcement_sync_requested.clear()
                        await self._sync_announcements(provider, analyst, alerts)
                    if self.financial_sync_requested.is_set():
                        self.financial_sync_requested.clear()
                        await self._sync_financials(provider, analyst, alerts)
                except Exception as exc:
                    message = str(exc)
                    self.status["last_error"] = message[:300]
                    if "429" in message or "Too Many" in message:
                        poll = min(10.0, max(2.0, poll * 2))
                self.status["effective_poll_seconds"] = poll
                elapsed = time.monotonic() - started
                await asyncio.sleep(max(0.05, poll - elapsed))
        finally:
            scheduler.shutdown(wait=False)
            await provider.close()
            self.status["running"] = False

    async def _process_event(self, event: MarketEvent, analyst: BAIAnalyst, alerts: AlertRouter) -> None:
        review = None
        should_analyze = event.severity in {"high", "critical"} or event.event_type == "financial_update"
        if should_analyze and self.settings.bai_auto_analyze and analyst.configured:
            try:
                rules_df = self.store.rules(event.symbol)
                review = await analyst.analyze_event(event, rules_df.to_dict(orient="records"))
                self.store.insert_ai_review(event, review, "B.AI", self.settings.bai_model)
                self.store.mark_event_ai(event.event_id, "completed")
            except Exception as exc:
                self.store.mark_event_ai(event.event_id, f"error:{type(exc).__name__}")
        else:
            self.store.mark_event_ai(event.event_id, "skipped")
        if event.severity in {"high", "critical"}:
            results = await alerts.send_high_priority(event, review)
            for channel, status in results.items():
                self.store.insert_alert_result(event.event_id, channel, status)

    async def _sync_announcements(self, provider, analyst: BAIAnalyst, alerts: AlertRouter) -> None:
        today = date.today()
        rows = await provider.get_announcements(self.settings.watch_symbols, today - timedelta(days=2), today)
        new_rows = [row for row in rows if self.store.insert_announcement(row)]
        for row in new_rows:
            symbol = str(row.get("thscode") or row.get("code") or self.settings.watch_symbols[0])
            title = str(row.get("reportTitle") or row.get("title") or "新公告")
            event = MarketEvent(
                symbol=symbol,
                event_type="announcement",
                severity="high" if any(key in title for key in ("监管", "处罚", "业绩预告", "减持", "重大")) else "medium",
                title="检测到新公告",
                detail=title,
                source_ref=str(row.get("pdfURL") or row.get("seq") or "ifind:report_query"),
                metrics={"announcement": row},
            )
            if self.store.insert_event(event):
                await self._process_event(event, analyst, alerts)

    async def _sync_financials(self, provider, analyst: BAIAnalyst, alerts: AlertRouter) -> None:
        rows = await provider.get_financials(self.settings.watch_symbols)
        changed_symbols: set[str] = set()
        for row in rows:
            if not self.store.insert_financial_snapshot(row):
                continue
            symbol = str(row.get("thscode") or row.get("code") or self.settings.watch_symbols[0])
            changed_symbols.add(symbol)
        for symbol in changed_symbols:
            evaluations = evaluate_financial_rules(self.store.financial_history(symbol), self.store.rules(symbol))
            triggered = [item for item in evaluations if item["triggered"]]
            core = [item for item in triggered if item["is_core"]]
            insufficient = [item for item in evaluations if item["status"] == "数据不足"]
            severity = "critical" if core else ("high" if triggered else "medium")
            detail = (
                f"Python规则引擎：触发{len(triggered)}条，其中核心{len(core)}条；"
                f"另有{len(insufficient)}条因连续期数不足无法判定。"
            )
            event = MarketEvent(
                symbol=symbol,
                event_type="financial_update",
                severity=severity,
                title="检测到新财务数据并完成失效规则计算",
                detail=detail,
                source_ref=f"ifind:basic_data_service:{symbol}",
                metrics={"rule_evaluations": evaluations},
            )
            if self.store.insert_event(event):
                await self._process_event(event, analyst, alerts)


_RUNTIME: RuntimeController | None = None
_LOCK = threading.Lock()


def get_runtime() -> RuntimeController:
    global _RUNTIME
    with _LOCK:
        if _RUNTIME is None:
            _RUNTIME = RuntimeController().start()
        return _RUNTIME
