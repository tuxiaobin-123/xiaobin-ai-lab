from __future__ import annotations

import math
import random
from datetime import datetime, timezone

from ..models import Quote
from .base import DataProvider


class MockProvider(DataProvider):
    """Deterministic market simulator used until iFinD credentials are configured."""

    def __init__(self, seed: int = 2261):
        self.random = random.Random(seed)
        self.tick = 0
        self.prices: dict[str, float] = {"002261.SZ": 25.93}
        self.volumes: dict[str, float] = {}

    async def get_quotes(self, symbols: tuple[str, ...]) -> list[Quote]:
        self.tick += 1
        now = datetime.now(timezone.utc)
        result: list[Quote] = []
        for index, symbol in enumerate(symbols):
            base = self.prices.setdefault(symbol, 20.0 + index * 3.5)
            wave = math.sin(self.tick / 21 + index) * 0.00045
            shock = self.random.gauss(0, 0.00035)
            latest = max(0.01, base * (1 + wave + shock))
            self.prices[symbol] = latest
            self.volumes[symbol] = self.volumes.get(symbol, 750_000) + max(0, self.random.gauss(320, 90))
            result.append(
                Quote(
                    symbol=symbol,
                    ts=now,
                    latest=round(latest, 3),
                    open=25.20 if symbol == "002261.SZ" else round(base, 3),
                    high=max(latest, 26.45 if symbol == "002261.SZ" else latest),
                    low=min(latest, 25.16 if symbol == "002261.SZ" else latest),
                    volume=round(self.volumes[symbol], 0),
                    amount=round(self.volumes[symbol] * latest * 100, 2),
                    change_ratio=latest / (25.93 / 1.0545) - 1 if symbol == "002261.SZ" else 0.0,
                    source="mock",
                    raw={"mock_tick": self.tick},
                )
            )
        return result

