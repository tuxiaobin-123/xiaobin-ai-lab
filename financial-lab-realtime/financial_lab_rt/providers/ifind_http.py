from __future__ import annotations

import json
from datetime import date, datetime, timezone
from typing import Any

import httpx
import pandas as pd

from ..config import Settings
from ..models import Quote
from .base import DataProvider


def _scalar(value: Any) -> Any:
    while isinstance(value, list) and value:
        value = value[0]
    return value


def _as_float(value: Any) -> float | None:
    value = _scalar(value)
    if value in (None, "", "--"):
        return None
    try:
        return float(str(value).replace(",", ""))
    except (TypeError, ValueError):
        return None


def _as_ratio(value: Any) -> float | None:
    number = _as_float(value)
    if number is None:
        return None
    return number / 100 if abs(number) > 1 else number


def _pick(row: dict[str, Any], *names: str) -> Any:
    lowered = {str(k).lower(): v for k, v in row.items()}
    for name in names:
        if name.lower() in lowered:
            return lowered[name.lower()]
        for key, value in lowered.items():
            if key.endswith(f".{name.lower()}"):
                return value
    return None


def _expand_rows(payload: dict[str, Any]) -> list[dict[str, Any]]:
    tables = payload.get("tables") or payload.get("data") or []
    if isinstance(tables, dict):
        tables = [tables]
    rows: list[dict[str, Any]] = []
    for table in tables:
        if not isinstance(table, dict):
            continue
        normalized = pd.json_normalize(table, sep=".").to_dict(orient="records")[0]
        lengths = [len(v) for v in normalized.values() if isinstance(v, list)]
        width = max(lengths, default=1)
        for index in range(width):
            row: dict[str, Any] = {}
            for key, value in normalized.items():
                if isinstance(value, list):
                    row[key] = value[index] if index < len(value) else None
                else:
                    row[key] = value
            rows.append(row)
    return rows


def normalize_realtime_payload(payload: dict[str, Any], source: str = "ifind_http") -> list[Quote]:
    quotes: list[Quote] = []
    for row in _expand_rows(payload):
        symbol = _scalar(_pick(row, "thscode", "code", "codes", "symbol"))
        latest = _as_float(_pick(row, "latest", "close"))
        if not symbol or latest is None:
            continue
        ts_raw = _scalar(_pick(row, "time", "timestamp", "datetime"))
        try:
            ts = datetime.fromisoformat(str(ts_raw).replace("Z", "+00:00")) if ts_raw else datetime.now(timezone.utc)
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
        except ValueError:
            ts = datetime.now(timezone.utc)
        quotes.append(
            Quote(
                symbol=str(symbol),
                ts=ts,
                latest=latest,
                open=_as_float(_pick(row, "open")),
                high=_as_float(_pick(row, "high")),
                low=_as_float(_pick(row, "low")),
                volume=_as_float(_pick(row, "volume")),
                amount=_as_float(_pick(row, "amount")),
                change_ratio=_as_ratio(_pick(row, "changeRatio", "change_ratio", "pct_chg")),
                source=source,
                raw=row,
            )
        )
    return quotes


class IFindHTTPProvider(DataProvider):
    def __init__(self, settings: Settings):
        if not settings.ifind_refresh_token:
            raise ValueError("IFIND_REFRESH_TOKEN未配置，无法启动iFinD实时模式。")
        self.settings = settings
        self.client = httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0))
        self.access_token = ""

    async def _refresh_access_token(self) -> None:
        response = await self.client.post(
            f"{self.settings.ifind_base_url}/get_access_token",
            headers={"Content-Type": "application/json", "refresh_token": self.settings.ifind_refresh_token},
        )
        response.raise_for_status()
        payload = response.json()
        self.access_token = payload.get("data", {}).get("access_token", "")
        if not self.access_token:
            raise RuntimeError("iFinD未返回access_token。")

    async def _post(self, path: str, body: dict[str, Any], retry_auth: bool = True) -> dict[str, Any]:
        if not self.access_token:
            await self._refresh_access_token()
        response = await self.client.post(
            f"{self.settings.ifind_base_url}/{path.lstrip('/')}",
            json=body,
            headers={"Content-Type": "application/json", "access_token": self.access_token},
        )
        if response.status_code == 401 and retry_auth:
            self.access_token = ""
            await self._refresh_access_token()
            return await self._post(path, body, retry_auth=False)
        response.raise_for_status()
        payload = response.json()
        error_code = payload.get("errorcode", payload.get("error_code", 0))
        if error_code not in (0, "0", None):
            raise RuntimeError(f"iFinD接口错误：{payload.get('errmsg') or payload.get('message') or error_code}")
        return payload

    async def get_quotes(self, symbols: tuple[str, ...]) -> list[Quote]:
        payload = await self._post(
            "real_time_quotation",
            {"codes": ",".join(symbols), "indicators": ",".join(self.settings.ifind_quote_indicators)},
        )
        return normalize_realtime_payload(payload)

    async def get_announcements(self, symbols: tuple[str, ...], begin: date, end: date) -> list[dict[str, Any]]:
        payload = await self._post(
            "report_query",
            {
                "codes": ",".join(symbols),
                "functionpara": {"reportType": "901"},
                "beginrDate": begin.isoformat(),
                "endrDate": end.isoformat(),
                "outputpara": "reportDate:Y,thscode:Y,secName:Y,ctime:Y,reportTitle:Y,pdfURL:Y,seq:Y",
            },
        )
        return _expand_rows(payload)

    async def get_financials(self, symbols: tuple[str, ...]) -> list[dict[str, Any]]:
        if not self.settings.ifind_financial_indicators:
            return []
        payload = await self._post(
            "basic_data_service",
            {"codes": ",".join(symbols), "indipara": self.settings.ifind_financial_indicators},
        )
        rows = _expand_rows(payload)
        if not self.settings.ifind_financial_field_map:
            return rows
        normalized = []
        for row in rows:
            mapped = dict(row)
            for canonical, source_key in self.settings.ifind_financial_field_map.items():
                mapped[canonical] = _scalar(_pick(row, source_key))
            normalized.append(mapped)
        return normalized

    async def close(self) -> None:
        await self.client.aclose()
