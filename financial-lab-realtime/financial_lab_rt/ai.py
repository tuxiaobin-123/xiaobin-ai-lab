from __future__ import annotations

import json
import re
from typing import Any

import httpx

from .config import Settings
from .models import MarketEvent


def parse_json_content(text: str) -> dict[str, Any]:
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    data = json.loads(cleaned)
    required = {"status", "summary", "supporting_evidence", "contrary_evidence", "risks", "missing_data"}
    missing = required - set(data)
    if missing:
        raise ValueError(f"B.AI响应缺少字段：{', '.join(sorted(missing))}")
    allowed = {"逻辑强化", "逻辑不变", "逻辑削弱", "逻辑失效", "证据不足"}
    if data["status"] not in allowed:
        data["status"] = "证据不足"
    return data


class BAIAnalyst:
    def __init__(self, settings: Settings):
        self.settings = settings

    @property
    def configured(self) -> bool:
        return self.settings.bai_ready

    async def analyze_event(self, event: MarketEvent, rules: list[dict[str, Any]]) -> dict[str, Any]:
        if not self.configured:
            raise RuntimeError("BAI_API_KEY未配置。")
        output_shape = {
            "status": "逻辑强化|逻辑不变|逻辑削弱|逻辑失效|证据不足",
            "summary": "不超过160字",
            "supporting_evidence": [{"claim": "", "source_ref": ""}],
            "contrary_evidence": [{"claim": "", "source_ref": ""}],
            "risks": [""],
            "missing_data": [""],
        }
        system = (
            "你是审慎的A股事件审计员。只判断新事件是否改变既有投资逻辑。"
            "不得给出买卖建议、目标价或确定性涨跌预测。所有证据必须引用输入中存在的source_ref；"
            "市场价格异动不能自动视为基本面证据。返回纯JSON。"
        )
        context = {
            "event": event.as_record(),
            "thesis": "国产AI算力需求增长→华为生态合作深化→业务增长→盈利和现金流改善",
            "rules": rules,
            "output_shape": output_shape,
        }
        payload = {
            "model": self.settings.bai_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(context, ensure_ascii=False, default=str)},
            ],
            "temperature": 0.1,
            "max_tokens": 1800,
            "stream": False,
            "response_format": {"type": "json_object"},
        }
        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0, connect=10.0)) as client:
            response = await client.post(
                f"{self.settings.bai_base_url}/v1/chat/completions",
                json=payload,
                headers={"Authorization": f"Bearer {self.settings.bai_api_key}", "Content-Type": "application/json"},
            )
        if response.status_code >= 400:
            raise RuntimeError(f"B.AI调用失败（HTTP {response.status_code}）。请检查密钥、余额和模型权限。")
        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        return parse_json_content(content)

