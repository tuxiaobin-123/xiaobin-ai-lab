from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


@dataclass
class Quote:
    symbol: str
    ts: datetime
    latest: float
    open: float | None = None
    high: float | None = None
    low: float | None = None
    volume: float | None = None
    amount: float | None = None
    change_ratio: float | None = None
    source: str = "unknown"
    raw: dict[str, Any] = field(default_factory=dict)

    def as_record(self) -> dict[str, Any]:
        record = asdict(self)
        record["ts"] = self.ts.astimezone(timezone.utc)
        return record


@dataclass
class MarketEvent:
    symbol: str
    event_type: str
    severity: str
    title: str
    detail: str
    source_ref: str
    metrics: dict[str, Any]
    ts: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    event_id: str = field(default_factory=lambda: str(uuid4()))

    def as_record(self) -> dict[str, Any]:
        return asdict(self)

