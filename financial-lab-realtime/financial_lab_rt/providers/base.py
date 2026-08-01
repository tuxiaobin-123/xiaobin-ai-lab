from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date
from typing import Any

from ..models import Quote


class DataProvider(ABC):
    @abstractmethod
    async def get_quotes(self, symbols: tuple[str, ...]) -> list[Quote]:
        raise NotImplementedError

    async def get_announcements(self, symbols: tuple[str, ...], begin: date, end: date) -> list[dict[str, Any]]:
        return []

    async def get_financials(self, symbols: tuple[str, ...]) -> list[dict[str, Any]]:
        return []

    async def close(self) -> None:
        return None

