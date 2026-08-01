from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from .config import Settings
from .models import MarketEvent
from .storage import Store


class EventEngine:
    def __init__(self, settings: Settings, store: Store):
        self.settings = settings
        self.store = store

    def evaluate(self, metrics: dict[str, Any]) -> list[MarketEvent]:
        if not metrics:
            return []
        symbol = metrics["symbol"]
        source_ref = f"{metrics.get('source', 'unknown')}:{symbol}:{metrics.get('ts')}"
        candidates: list[tuple[str, str, str, str]] = []
        change = metrics.get("change_ratio")
        fast = metrics.get("momentum_60s")
        volume = metrics.get("volume_acceleration")
        drawdown = metrics.get("drawdown")

        if change is not None and abs(change) >= self.settings.price_change_alert:
            severity = "critical" if abs(change) >= 0.08 else "high"
            candidates.append(("price_change", severity, "日内涨跌幅达到阈值", f"当前涨跌幅{change:.2%}"))
        if fast is not None and abs(fast) >= self.settings.fast_move_alert:
            candidates.append(("fast_move", "high", "60秒价格快速异动", f"60秒价格变化{fast:.2%}"))
        if volume is not None and volume >= self.settings.volume_acceleration_alert:
            severity = "high" if volume >= self.settings.volume_acceleration_alert * 2 else "medium"
            candidates.append(("volume_acceleration", severity, "成交速度异常放大", f"成交增量速度为近期基线{volume:.1f}倍"))
        if drawdown is not None and drawdown <= self.settings.max_drawdown_alert:
            candidates.append(("drawdown", "high", "监控窗口回撤达到阈值", f"窗口最大回撤{drawdown:.2%}"))

        events: list[MarketEvent] = []
        for event_type, severity, title, detail in candidates:
            if self.store.event_in_cooldown(symbol, event_type, self.settings.event_cooldown_seconds):
                continue
            events.append(
                MarketEvent(
                    symbol=symbol,
                    event_type=event_type,
                    severity=severity,
                    title=title,
                    detail=detail,
                    source_ref=source_ref,
                    metrics=metrics,
                    ts=datetime.now(timezone.utc),
                )
            )
        return events

