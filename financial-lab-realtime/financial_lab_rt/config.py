from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv


def _bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except ValueError:
        return default


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


def _json_list(name: str) -> list[dict]:
    raw = os.getenv(name, "[]")
    try:
        value = json.loads(raw)
        return value if isinstance(value, list) else []
    except json.JSONDecodeError:
        return []


def _json_dict(name: str) -> dict[str, str]:
    raw = os.getenv(name, "{}")
    try:
        value = json.loads(raw)
        return {str(key): str(item) for key, item in value.items()} if isinstance(value, dict) else {}
    except json.JSONDecodeError:
        return {}


@dataclass(frozen=True)
class Settings:
    root: Path
    data_mode: str = "mock"
    watch_symbols: tuple[str, ...] = ("002261.SZ",)
    quote_poll_seconds: float = 1.0
    dashboard_refresh_seconds: float = 1.0
    market_hours_only: bool = True
    db_path: Path = Path("data/financial_lab.duckdb")
    quote_retention_days: int = 30

    ifind_base_url: str = "https://quantapi.51ifind.com/api/v1"
    ifind_refresh_token: str = ""
    ifind_quote_indicators: tuple[str, ...] = ("latest", "open", "high", "low", "volume", "amount", "changeRatio")
    ifind_financial_indicators: list[dict] = field(default_factory=list)
    ifind_financial_field_map: dict[str, str] = field(default_factory=dict)

    bai_api_key: str = ""
    bai_base_url: str = "https://api.b.ai"
    bai_model: str = "deepseek-v4-pro"
    bai_auto_analyze: bool = True

    price_change_alert: float = 0.05
    fast_move_alert: float = 0.02
    volume_acceleration_alert: float = 3.0
    max_drawdown_alert: float = -0.08
    event_cooldown_seconds: int = 900

    wecom_webhook_url: str = ""
    smtp_host: str = ""
    smtp_port: int = 465
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    alert_email_to: str = ""

    @property
    def live_ready(self) -> bool:
        return self.data_mode == "ifind_http" and bool(self.ifind_refresh_token)

    @property
    def bai_ready(self) -> bool:
        return bool(self.bai_api_key)


def load_settings(root: Path | None = None) -> Settings:
    project_root = (root or Path(__file__).resolve().parents[1]).resolve()
    load_dotenv(project_root / ".env.local", override=False)
    load_dotenv(project_root / ".env", override=False)
    symbols = tuple(s.strip().upper() for s in os.getenv("WATCH_SYMBOLS", "002261.SZ").split(",") if s.strip())
    indicators = tuple(i.strip() for i in os.getenv("IFIND_QUOTE_INDICATORS", "latest,open,high,low,volume,amount,changeRatio").split(",") if i.strip())
    db_raw = Path(os.getenv("DB_PATH", "data/financial_lab.duckdb"))
    db_path = db_raw if db_raw.is_absolute() else project_root / db_raw
    return Settings(
        root=project_root,
        data_mode=os.getenv("DATA_MODE", "mock").strip().lower(),
        watch_symbols=symbols or ("002261.SZ",),
        quote_poll_seconds=max(0.5, _float("QUOTE_POLL_SECONDS", 1.0)),
        dashboard_refresh_seconds=max(1.0, _float("DASHBOARD_REFRESH_SECONDS", 1.0)),
        market_hours_only=_bool("MARKET_HOURS_ONLY", True),
        db_path=db_path,
        quote_retention_days=max(1, _int("QUOTE_RETENTION_DAYS", 30)),
        ifind_base_url=os.getenv("IFIND_BASE_URL", "https://quantapi.51ifind.com/api/v1").rstrip("/"),
        ifind_refresh_token=os.getenv("IFIND_REFRESH_TOKEN", ""),
        ifind_quote_indicators=indicators,
        ifind_financial_indicators=_json_list("IFIND_FINANCIAL_INDICATORS_JSON"),
        ifind_financial_field_map=_json_dict("IFIND_FINANCIAL_FIELD_MAP_JSON"),
        bai_api_key=os.getenv("BAI_API_KEY", ""),
        bai_base_url=os.getenv("BAI_BASE_URL", "https://api.b.ai").rstrip("/"),
        bai_model=os.getenv("BAI_MODEL", "deepseek-v4-pro"),
        bai_auto_analyze=_bool("BAI_AUTO_ANALYZE", True),
        price_change_alert=_float("PRICE_CHANGE_ALERT", 0.05),
        fast_move_alert=_float("FAST_MOVE_ALERT", 0.02),
        volume_acceleration_alert=_float("VOLUME_ACCELERATION_ALERT", 3.0),
        max_drawdown_alert=_float("MAX_DRAWDOWN_ALERT", -0.08),
        event_cooldown_seconds=max(60, _int("EVENT_COOLDOWN_SECONDS", 900)),
        wecom_webhook_url=os.getenv("WECOM_WEBHOOK_URL", ""),
        smtp_host=os.getenv("SMTP_HOST", ""),
        smtp_port=_int("SMTP_PORT", 465),
        smtp_username=os.getenv("SMTP_USERNAME", ""),
        smtp_password=os.getenv("SMTP_PASSWORD", ""),
        smtp_from=os.getenv("SMTP_FROM", ""),
        alert_email_to=os.getenv("ALERT_EMAIL_TO", ""),
    )
