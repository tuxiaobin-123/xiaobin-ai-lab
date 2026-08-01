from __future__ import annotations

import tempfile
import unittest
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pandas as pd

from financial_lab_rt.ai import parse_json_content
from financial_lab_rt.analytics import calculate_realtime_metrics
from financial_lab_rt.config import Settings
from financial_lab_rt.events import EventEngine
from financial_lab_rt.financial_rules import evaluate_financial_rules
from financial_lab_rt.models import Quote
from financial_lab_rt.providers.ifind_http import normalize_realtime_payload
from financial_lab_rt.runtime import market_is_open
from financial_lab_rt.storage import Store


class IFindParserTests(unittest.TestCase):
    def test_nested_tables_payload(self):
        payload = {
            "errorcode": 0,
            "tables": [
                {
                    "thscode": ["002261.SZ"],
                    "time": ["2026-08-01T01:30:00+00:00"],
                    "table": {
                        "latest": [25.93], "open": [25.20], "high": [26.45], "low": [25.16],
                        "volume": [750272], "amount": [1900000000], "changeRatio": [5.45],
                    },
                }
            ],
        }
        quotes = normalize_realtime_payload(payload)
        self.assertEqual(len(quotes), 1)
        self.assertEqual(quotes[0].symbol, "002261.SZ")
        self.assertEqual(quotes[0].latest, 25.93)
        self.assertAlmostEqual(quotes[0].change_ratio, 0.0545)


class AnalyticsTests(unittest.TestCase):
    def test_metrics(self):
        rows = []
        for i in range(70):
            rows.append(
                {
                    "ts": pd.Timestamp("2026-08-01T01:30:00Z") + pd.Timedelta(i, unit="s"),
                    "symbol": "002261.SZ", "latest": 25 + i * 0.001, "volume": 1000 + i * 10,
                    "change_ratio": 0.03, "source": "test",
                }
            )
        metrics = calculate_realtime_metrics(pd.DataFrame(rows))
        self.assertEqual(metrics["observations"], 70)
        self.assertGreater(metrics["momentum_60s"], 0)
        self.assertAlmostEqual(metrics["volume_acceleration"], 1.0)


class EventAndStoreTests(unittest.TestCase):
    def test_high_price_event_and_cooldown(self):
        with tempfile.TemporaryDirectory() as directory:
            settings = Settings(root=Path(directory), db_path=Path(directory) / "lab.duckdb")
            store = Store(settings.db_path)
            engine = EventEngine(settings, store)
            metrics = {"symbol": "002261.SZ", "source": "test", "ts": "now", "change_ratio": 0.06, "momentum_60s": 0.0, "drawdown": 0.0, "volume_acceleration": 1.0}
            events = engine.evaluate(metrics)
            self.assertEqual(len(events), 1)
            self.assertEqual(events[0].severity, "high")
            store.insert_event(events[0])
            self.assertEqual(engine.evaluate(metrics), [])

    def test_quote_roundtrip(self):
        with tempfile.TemporaryDirectory() as directory:
            store = Store(Path(directory) / "lab.duckdb")
            store.insert_quotes([Quote(symbol="002261.SZ", ts=datetime.now(ZoneInfo("UTC")), latest=25.93, source="test")])
            latest = store.latest_quotes()
            self.assertEqual(len(latest), 1)
            self.assertEqual(float(latest.iloc[0]["latest"]), 25.93)

    def test_alert_result_roundtrip(self):
        with tempfile.TemporaryDirectory() as directory:
            store = Store(Path(directory) / "lab.duckdb")
            store.insert_alert_result("event-1", "wecom", "not_configured")
            alerts = store.recent_alerts()
            self.assertEqual(len(alerts), 1)
            self.assertEqual(alerts.iloc[0]["status"], "not_configured")


class FinancialRuleTests(unittest.TestCase):
    def test_consecutive_period_trigger_and_insufficient_data(self):
        rows = [
            {"report_period": "2026-03-31", "adjusted_profit": -775.48, "revenue_yoy": -4.72},
            {"report_period": "2025-12-31", "adjusted_profit": -4019.22},
        ]
        rules = pd.DataFrame(
            [
                {"rule_id": "profit", "name": "扣非", "condition_text": "连续2期为负", "metric_key": "adjusted_profit", "operator": "<", "threshold": 0.0, "periods_required": 2, "is_core": False, "enabled": True},
                {"rule_id": "revenue", "name": "收入", "condition_text": "连续2期同比为负", "metric_key": "revenue_yoy", "operator": "<", "threshold": 0.0, "periods_required": 2, "is_core": True, "enabled": True},
            ]
        )
        outcomes = {item["rule_id"]: item for item in evaluate_financial_rules(rows, rules)}
        self.assertEqual(outcomes["profit"]["status"], "触发")
        self.assertEqual(outcomes["revenue"]["status"], "数据不足")
        self.assertAlmostEqual(outcomes["revenue"]["observations"][0]["value"], -0.0472)


class AITests(unittest.TestCase):
    def test_parse_json(self):
        raw = """```json
        {"status":"逻辑削弱","summary":"现金流风险上升","supporting_evidence":[],"contrary_evidence":[{"claim":"现金流恶化","source_ref":"ifind:1"}],"risks":["高估值"],"missing_data":["毛利率"]}
        ```"""
        result = parse_json_content(raw)
        self.assertEqual(result["status"], "逻辑削弱")


class MarketHoursTests(unittest.TestCase):
    def test_market_sessions(self):
        tz = ZoneInfo("Asia/Shanghai")
        self.assertTrue(market_is_open(datetime(2026, 7, 31, 10, 0, tzinfo=tz)))
        self.assertFalse(market_is_open(datetime(2026, 8, 1, 10, 0, tzinfo=tz)))
        self.assertFalse(market_is_open(datetime(2026, 7, 31, 12, 0, tzinfo=tz)))


if __name__ == "__main__":
    unittest.main()
