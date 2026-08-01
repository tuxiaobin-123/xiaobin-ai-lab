from __future__ import annotations

import csv
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from .models import Quote
from .storage import Store


RULES = [
    {
        "rule_id": "CORE-REV-01", "symbol": "002261.SZ", "name": "收入增长失速",
        "condition_text": "同口径营业收入同比连续2期低于0%", "metric_key": "revenue_yoy",
        "operator": "<", "threshold": 0.0, "periods_required": 2, "is_core": True,
    },
    {
        "rule_id": "CORE-MARGIN-01", "symbol": "002261.SZ", "name": "毛利率持续下降",
        "condition_text": "毛利率连续2期同比下降超过3个百分点", "metric_key": "gross_margin_yoy_delta",
        "operator": "<", "threshold": -0.03, "periods_required": 2, "is_core": True,
    },
    {
        "rule_id": "QUALITY-CFO-01", "symbol": "002261.SZ", "name": "现金转化恶化",
        "condition_text": "经营现金流/归母净利润连续2期低于0.6", "metric_key": "cash_conversion",
        "operator": "<", "threshold": 0.6, "periods_required": 2, "is_core": False,
    },
    {
        "rule_id": "QUALITY-ADJ-01", "symbol": "002261.SZ", "name": "扣非盈利质量",
        "condition_text": "连续2个已披露报告扣非净利润为负", "metric_key": "adjusted_profit",
        "operator": "<", "threshold": 0.0, "periods_required": 2, "is_core": False,
    },
]


def _section(lines: list[str], heading: str) -> list[str]:
    start = next((i for i, line in enumerate(lines) if line.startswith(heading)), None)
    if start is None:
        return []
    result = []
    for line in lines[start + 1 :]:
        if line.startswith("## SECTION") or line.startswith("# END"):
            break
        if line.strip():
            result.append(line)
    return result


def seed_from_csv(store: Store, csv_path: Path) -> None:
    if store.get_state("seed_version") == "2" or not csv_path.exists():
        return
    lines = csv_path.read_text(encoding="utf-8-sig").splitlines()
    price_lines = _section(lines, "## SECTION 1")
    if price_lines and store.quote_count() == 0:
        rows = list(csv.DictReader(price_lines))
        shanghai = ZoneInfo("Asia/Shanghai")
        quotes = []
        for row in rows:
            ts = datetime.fromisoformat(f"{row['日期']}T15:00:00").replace(tzinfo=shanghai)
            quotes.append(
                Quote(
                    symbol="002261.SZ", ts=ts, latest=float(row["收盘价"]), open=float(row["开盘价"]),
                    high=float(row["最高价"]), low=float(row["最低价"]), volume=float(row["成交量(手)"]),
                    change_ratio=float(row["涨跌幅"].rstrip("%")) / 100, source="csv_seed", raw=row,
                )
            )
        store.insert_quotes(quotes)
    financial_lines = _section(lines, "## SECTION 2")
    if financial_lines:
        financial_rows = list(csv.DictReader(financial_lines))
        by_period = {row["报告期"]: row for row in financial_rows}
        for row in financial_rows:
            period = row["报告期"]
            previous = by_period.get(f"{int(period[:4]) - 1}{period[4:]}")
            revenue = float(row["营业总收入(万元)"])
            net_profit = float(row["归母净利润(万元)"])
            adjusted_profit = float(row["扣非净利润(万元)"])
            cash_flow = float(row["经营活动现金流净额(万元)"])
            canonical = {
                "thscode": "002261.SZ",
                "report_period": period,
                "total_revenue": revenue,
                "net_profit": net_profit,
                "adjusted_profit": adjusted_profit,
                "cash_flow_ops": cash_flow,
                "cash_conversion": cash_flow / net_profit if net_profit else None,
                "source_ref": f"csv:SECTION2:{period}",
            }
            if previous:
                previous_revenue = float(previous["营业总收入(万元)"])
                canonical["revenue_yoy"] = revenue / previous_revenue - 1 if previous_revenue else None
            store.insert_financial_snapshot(canonical)
    announcement_lines = _section(lines, "## SECTION 5")
    if announcement_lines:
        for index, row in enumerate(csv.DictReader(announcement_lines)):
            raw_date = row["日期"]
            published = raw_date if len(raw_date) == 10 else datetime.now(timezone.utc)
            store.insert_announcement(
                {
                    "seq": f"csv-section5-{index}",
                    "thscode": "002261.SZ",
                    "reportDate": published,
                    "reportTitle": row["标题/摘要"],
                    "source_note": row["来源备注"],
                }
            )
    for rule in RULES:
        store.upsert_rule(rule)
    store.set_state("seed_version", "2")
