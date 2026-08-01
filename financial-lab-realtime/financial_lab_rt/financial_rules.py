from __future__ import annotations

from typing import Any

import pandas as pd


def _number(value: Any) -> float | None:
    if value is None or value == "":
        return None
    if isinstance(value, str):
        text = value.strip().replace(",", "")
        percent = text.endswith("%")
        text = text.rstrip("%")
        try:
            number = float(text)
        except ValueError:
            return None
        return number / 100 if percent else number
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _matches(value: float, operator: str, threshold: float) -> bool:
    return {
        "<": value < threshold,
        "<=": value <= threshold,
        ">": value > threshold,
        ">=": value >= threshold,
        "==": value == threshold,
        "!=": value != threshold,
    }.get(operator, False)


def evaluate_financial_rules(rows: list[dict[str, Any]], rules: pd.DataFrame) -> list[dict[str, Any]]:
    """Evaluate latest consecutive disclosed periods without asking an LLM to do arithmetic."""
    outcomes: list[dict[str, Any]] = []
    for rule in rules.to_dict(orient="records"):
        if not rule.get("enabled", True):
            continue
        key = str(rule["metric_key"])
        required = int(rule["periods_required"])
        threshold = float(rule["threshold"])
        observations: list[dict[str, Any]] = []
        for row in rows:
            value = _number(row.get(key))
            if value is None:
                continue
            if key in {"revenue_yoy", "gross_margin_yoy_delta"} and abs(value) > 2:
                value /= 100
            observations.append({"period": str(row.get("report_period", "unknown")), "value": value})
            if len(observations) >= required:
                break
        enough = len(observations) >= required
        triggered = enough and all(_matches(item["value"], str(rule["operator"]), threshold) for item in observations)
        outcomes.append(
            {
                "rule_id": rule["rule_id"],
                "name": rule["name"],
                "is_core": bool(rule["is_core"]),
                "condition": rule["condition_text"],
                "status": "触发" if triggered else ("未触发" if enough else "数据不足"),
                "triggered": triggered,
                "required_periods": required,
                "observations": observations,
            }
        )
    return outcomes
