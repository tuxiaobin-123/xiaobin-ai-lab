from __future__ import annotations

import math
from typing import Any

import pandas as pd


def _safe(value: float | None) -> float | None:
    if value is None or not math.isfinite(value):
        return None
    return round(float(value), 6)


def calculate_realtime_metrics(frame: pd.DataFrame) -> dict[str, Any]:
    if frame.empty:
        return {}
    df = frame.sort_values("ts").copy()
    latest = df.iloc[-1]
    prices = pd.to_numeric(df["latest"], errors="coerce").dropna()
    returns = prices.pct_change().dropna()
    peak = prices.cummax()
    drawdowns = prices / peak - 1

    momentum_60s = None
    if len(prices) >= 2:
        lookback = max(0, len(prices) - 61)
        base = prices.iloc[lookback]
        momentum_60s = prices.iloc[-1] / base - 1 if base else None

    volume_acceleration = None
    if "volume" in df and df["volume"].notna().sum() >= 5:
        volume = pd.to_numeric(df["volume"], errors="coerce")
        increments = volume.diff().clip(lower=0).dropna()
        baseline = increments.iloc[-61:-1].mean() if len(increments) > 2 else None
        if baseline and baseline > 0:
            volume_acceleration = increments.iloc[-1] / baseline

    annualized_tick_vol = returns.std(ddof=1) * math.sqrt(252 * 4 * 60 * 60) if len(returns) >= 10 else None
    change_ratio = latest.get("change_ratio")
    if pd.isna(change_ratio):
        change_ratio = None
    return {
        "symbol": str(latest["symbol"]),
        "ts": latest["ts"],
        "latest": _safe(float(latest["latest"])),
        "change_ratio": _safe(change_ratio),
        "momentum_60s": _safe(momentum_60s),
        "drawdown": _safe(drawdowns.min() if not drawdowns.empty else None),
        "volume_acceleration": _safe(volume_acceleration),
        "tick_volatility_annualized": _safe(annualized_tick_vol),
        "observations": int(len(df)),
        "source": str(latest.get("source", "unknown")),
    }

