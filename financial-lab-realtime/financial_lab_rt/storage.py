from __future__ import annotations

import json
import hashlib
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import RLock
from typing import Any

import duckdb
import pandas as pd

from .models import MarketEvent, Quote


SCHEMA = """
CREATE TABLE IF NOT EXISTS quotes (
  ts TIMESTAMPTZ NOT NULL,
  symbol VARCHAR NOT NULL,
  latest DOUBLE NOT NULL,
  open DOUBLE,
  high DOUBLE,
  low DOUBLE,
  volume DOUBLE,
  amount DOUBLE,
  change_ratio DOUBLE,
  source VARCHAR NOT NULL,
  raw_json JSON
);
CREATE INDEX IF NOT EXISTS idx_quotes_symbol_ts ON quotes(symbol, ts);

CREATE TABLE IF NOT EXISTS announcements (
  announcement_id VARCHAR PRIMARY KEY,
  symbol VARCHAR,
  published_at TIMESTAMPTZ,
  title VARCHAR,
  url VARCHAR,
  source VARCHAR,
  raw_json JSON
);

CREATE TABLE IF NOT EXISTS financial_snapshots (
  snapshot_id VARCHAR PRIMARY KEY,
  symbol VARCHAR,
  report_period VARCHAR,
  observed_at TIMESTAMPTZ,
  source VARCHAR,
  raw_json JSON
);

CREATE TABLE IF NOT EXISTS events (
  event_id VARCHAR PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL,
  symbol VARCHAR NOT NULL,
  event_type VARCHAR NOT NULL,
  severity VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  detail VARCHAR,
  source_ref VARCHAR,
  metrics_json JSON,
  ai_status VARCHAR DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_events_symbol_ts ON events(symbol, ts);

CREATE TABLE IF NOT EXISTS ai_reviews (
  review_id VARCHAR PRIMARY KEY,
  event_id VARCHAR,
  symbol VARCHAR,
  created_at TIMESTAMPTZ,
  provider VARCHAR,
  model VARCHAR,
  thesis_status VARCHAR,
  summary VARCHAR,
  payload_json JSON
);

CREATE TABLE IF NOT EXISTS alerts (
  alert_id VARCHAR PRIMARY KEY,
  event_id VARCHAR,
  channel VARCHAR,
  sent_at TIMESTAMPTZ,
  status VARCHAR,
  detail VARCHAR
);

CREATE TABLE IF NOT EXISTS thesis_rules (
  rule_id VARCHAR PRIMARY KEY,
  symbol VARCHAR,
  name VARCHAR,
  condition_text VARCHAR,
  metric_key VARCHAR,
  operator VARCHAR,
  threshold DOUBLE,
  periods_required INTEGER,
  is_core BOOLEAN,
  enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS system_state (
  key VARCHAR PRIMARY KEY,
  value VARCHAR,
  updated_at TIMESTAMPTZ
);
"""


class Store:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.lock = RLock()
        self.initialize()

    def connect(self):
        conn = duckdb.connect(str(self.path))
        conn.execute("SET TimeZone='Asia/Shanghai'")
        return conn

    def initialize(self) -> None:
        with self.lock, self.connect() as conn:
            conn.execute(SCHEMA)

    def set_state(self, key: str, value: str) -> None:
        with self.lock, self.connect() as conn:
            conn.execute(
                "INSERT INTO system_state VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
                [key, value, datetime.now(timezone.utc)],
            )

    def get_state(self, key: str) -> str | None:
        with self.lock, self.connect() as conn:
            row = conn.execute("SELECT value FROM system_state WHERE key=?", [key]).fetchone()
        return row[0] if row else None

    def insert_quotes(self, quotes: list[Quote]) -> int:
        if not quotes:
            return 0
        records = []
        for quote in quotes:
            row = quote.as_record()
            row["raw_json"] = json.dumps(row.pop("raw"), ensure_ascii=False, default=str)
            records.append(row)
        frame = pd.DataFrame(records)
        with self.lock, self.connect() as conn:
            conn.register("quote_batch", frame)
            conn.execute(
                """
                INSERT INTO quotes
                SELECT ts, symbol, latest, open, high, low, volume, amount, change_ratio, source, raw_json::JSON
                FROM quote_batch
                """
            )
            conn.unregister("quote_batch")
        return len(records)

    def latest_quotes(self) -> pd.DataFrame:
        query = """
        SELECT q.* EXCLUDE(raw_json)
        FROM quotes q
        INNER JOIN (SELECT symbol, MAX(ts) AS ts FROM quotes GROUP BY symbol) latest
          ON q.symbol=latest.symbol AND q.ts=latest.ts
        ORDER BY q.symbol
        """
        with self.lock, self.connect() as conn:
            return conn.execute(query).df()

    def recent_quotes(self, symbol: str, minutes: int = 60, limit: int = 5000) -> pd.DataFrame:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        with self.lock, self.connect() as conn:
            return conn.execute(
                "SELECT * EXCLUDE(raw_json) FROM quotes WHERE symbol=? AND ts>=? ORDER BY ts DESC LIMIT ?",
                [symbol, cutoff, limit],
            ).df().sort_values("ts")

    def quote_count(self) -> int:
        with self.lock, self.connect() as conn:
            return int(conn.execute("SELECT COUNT(*) FROM quotes").fetchone()[0])

    def insert_event(self, event: MarketEvent) -> bool:
        with self.lock, self.connect() as conn:
            exists = conn.execute("SELECT 1 FROM events WHERE event_id=?", [event.event_id]).fetchone()
            if exists:
                return False
            conn.execute(
                "INSERT INTO events(event_id,ts,symbol,event_type,severity,title,detail,source_ref,metrics_json) VALUES (?,?,?,?,?,?,?,?,?::JSON)",
                [
                    event.event_id,
                    event.ts,
                    event.symbol,
                    event.event_type,
                    event.severity,
                    event.title,
                    event.detail,
                    event.source_ref,
                    json.dumps(event.metrics, ensure_ascii=False, default=str),
                ],
            )
        return True

    def event_in_cooldown(self, symbol: str, event_type: str, seconds: int) -> bool:
        cutoff = datetime.now(timezone.utc) - timedelta(seconds=seconds)
        with self.lock, self.connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM events WHERE symbol=? AND event_type=? AND ts>=? LIMIT 1",
                [symbol, event_type, cutoff],
            ).fetchone()
        return bool(row)

    def recent_events(self, limit: int = 100) -> pd.DataFrame:
        with self.lock, self.connect() as conn:
            return conn.execute(
                "SELECT * EXCLUDE(metrics_json) FROM events ORDER BY ts DESC LIMIT ?", [limit]
            ).df()

    def mark_event_ai(self, event_id: str, status: str) -> None:
        with self.lock, self.connect() as conn:
            conn.execute("UPDATE events SET ai_status=? WHERE event_id=?", [status, event_id])

    def insert_ai_review(self, event: MarketEvent, review: dict[str, Any], provider: str, model: str) -> None:
        review_id = f"{event.event_id}:{provider}:{model}"
        with self.lock, self.connect() as conn:
            conn.execute(
                """
                INSERT INTO ai_reviews VALUES (?,?,?,?,?,?,?,?,?::JSON)
                ON CONFLICT(review_id) DO NOTHING
                """,
                [
                    review_id,
                    event.event_id,
                    event.symbol,
                    datetime.now(timezone.utc),
                    provider,
                    model,
                    review.get("status", "证据不足"),
                    review.get("summary", ""),
                    json.dumps(review, ensure_ascii=False, default=str),
                ],
            )

    def latest_ai_reviews(self, limit: int = 30) -> pd.DataFrame:
        with self.lock, self.connect() as conn:
            return conn.execute(
                "SELECT * EXCLUDE(payload_json) FROM ai_reviews ORDER BY created_at DESC LIMIT ?", [limit]
            ).df()

    def insert_announcement(self, row: dict[str, Any]) -> bool:
        raw = json.dumps(row, ensure_ascii=False, default=str)
        identifier = str(row.get("seq") or row.get("pdfURL") or hashlib.sha256(raw.encode("utf-8")).hexdigest())
        symbol = str(row.get("thscode") or row.get("code") or "")
        published = row.get("ctime") or row.get("reportDate") or datetime.now(timezone.utc)
        title = str(row.get("reportTitle") or row.get("title") or "未命名公告")
        url = str(row.get("pdfURL") or row.get("url") or "")
        with self.lock, self.connect() as conn:
            before = conn.execute("SELECT COUNT(*) FROM announcements WHERE announcement_id=?", [identifier]).fetchone()[0]
            conn.execute(
                "INSERT INTO announcements VALUES (?,?,?,?,?,?,?::JSON) ON CONFLICT(announcement_id) DO NOTHING",
                [identifier, symbol, published, title, url, "ifind", raw],
            )
        return before == 0

    def recent_announcements(self, limit: int = 50) -> pd.DataFrame:
        with self.lock, self.connect() as conn:
            return conn.execute(
                "SELECT * EXCLUDE(raw_json) FROM announcements ORDER BY published_at DESC NULLS LAST LIMIT ?", [limit]
            ).df()

    def insert_financial_snapshot(self, row: dict[str, Any]) -> bool:
        raw = json.dumps(row, ensure_ascii=False, default=str)
        symbol = str(row.get("thscode") or row.get("code") or "")
        period = str(row.get("report_period") or row.get("reportDate") or row.get("报告期") or "unknown")
        identifier = f"{symbol}:{period}:{hashlib.sha256(raw.encode('utf-8')).hexdigest()}"
        with self.lock, self.connect() as conn:
            before = conn.execute("SELECT COUNT(*) FROM financial_snapshots WHERE snapshot_id=?", [identifier]).fetchone()[0]
            conn.execute(
                "INSERT INTO financial_snapshots VALUES (?,?,?,?,?,?::JSON) ON CONFLICT(snapshot_id) DO NOTHING",
                [identifier, symbol, period, datetime.now(timezone.utc), "ifind", raw],
            )
        return before == 0

    def financial_history(self, symbol: str, limit: int = 20) -> list[dict[str, Any]]:
        with self.lock, self.connect() as conn:
            rows = conn.execute(
                """
                SELECT report_period, raw_json::VARCHAR
                FROM (
                  SELECT *, ROW_NUMBER() OVER (
                    PARTITION BY symbol, report_period ORDER BY observed_at DESC
                  ) AS revision_rank
                  FROM financial_snapshots WHERE symbol=?
                ) revisions
                WHERE revision_rank=1
                ORDER BY report_period DESC
                LIMIT ?
                """,
                [symbol, limit],
            ).fetchall()
        history = []
        for period, raw in rows:
            item = json.loads(raw)
            item.setdefault("report_period", period)
            history.append(item)
        return history

    def insert_alert_result(self, event_id: str, channel: str, status: str, detail: str = "") -> None:
        alert_id = f"{event_id}:{channel}"
        with self.lock, self.connect() as conn:
            conn.execute(
                """
                INSERT INTO alerts VALUES (?,?,?,?,?,?)
                ON CONFLICT(alert_id) DO UPDATE SET
                  sent_at=excluded.sent_at, status=excluded.status, detail=excluded.detail
                """,
                [alert_id, event_id, channel, datetime.now(timezone.utc), status, detail],
            )

    def recent_alerts(self, limit: int = 50) -> pd.DataFrame:
        with self.lock, self.connect() as conn:
            return conn.execute(
                "SELECT * FROM alerts ORDER BY sent_at DESC LIMIT ?", [limit]
            ).df()

    def upsert_rule(self, rule: dict[str, Any]) -> None:
        with self.lock, self.connect() as conn:
            conn.execute(
                """
                INSERT INTO thesis_rules VALUES (?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(rule_id) DO UPDATE SET
                  name=excluded.name, condition_text=excluded.condition_text, metric_key=excluded.metric_key,
                  operator=excluded.operator, threshold=excluded.threshold, periods_required=excluded.periods_required,
                  is_core=excluded.is_core, enabled=excluded.enabled
                """,
                [
                    rule["rule_id"], rule["symbol"], rule["name"], rule["condition_text"], rule["metric_key"],
                    rule["operator"], rule["threshold"], rule["periods_required"], rule["is_core"], rule.get("enabled", True),
                ],
            )

    def rules(self, symbol: str) -> pd.DataFrame:
        with self.lock, self.connect() as conn:
            return conn.execute("SELECT * FROM thesis_rules WHERE symbol=? ORDER BY is_core DESC, rule_id", [symbol]).df()

    def cleanup_quotes(self, retention_days: int) -> int:
        cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
        with self.lock, self.connect() as conn:
            before = conn.execute("SELECT COUNT(*) FROM quotes WHERE ts<?", [cutoff]).fetchone()[0]
            conn.execute("DELETE FROM quotes WHERE ts<?", [cutoff])
        return int(before)

    def status(self) -> dict[str, Any]:
        with self.lock, self.connect() as conn:
            quote_count = conn.execute("SELECT COUNT(*) FROM quotes").fetchone()[0]
            event_count = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
            announcement_count = conn.execute("SELECT COUNT(*) FROM announcements").fetchone()[0]
            alert_count = conn.execute("SELECT COUNT(*) FROM alerts").fetchone()[0]
            latest = conn.execute("SELECT MAX(ts) FROM quotes").fetchone()[0]
        return {
            "quote_count": int(quote_count),
            "event_count": int(event_count),
            "announcement_count": int(announcement_count),
            "alert_count": int(alert_count),
            "latest_quote_at": latest,
        }
