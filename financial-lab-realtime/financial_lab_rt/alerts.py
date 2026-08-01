from __future__ import annotations

import asyncio
import smtplib
import ssl
from email.message import EmailMessage
from typing import Any

import httpx

from .config import Settings
from .models import MarketEvent


class AlertRouter:
    def __init__(self, settings: Settings):
        self.settings = settings

    def _message(self, event: MarketEvent, review: dict[str, Any] | None) -> str:
        lines = [
            f"【Financial Lab {event.severity.upper()}】{event.symbol}",
            event.title,
            event.detail,
            f"证据：{event.source_ref}",
        ]
        if review:
            lines.extend([f"逻辑状态：{review.get('status', '证据不足')}", f"AI复核：{review.get('summary', '')}"])
        lines.append("研究辅助，不构成投资建议。")
        return "\n".join(lines)

    async def send_wecom(self, event: MarketEvent, review: dict[str, Any] | None) -> str:
        if not self.settings.wecom_webhook_url:
            return "not_configured"
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                self.settings.wecom_webhook_url,
                json={"msgtype": "text", "text": {"content": self._message(event, review)}},
            )
            response.raise_for_status()
        return "sent"

    def _send_email_sync(self, event: MarketEvent, review: dict[str, Any] | None) -> str:
        s = self.settings
        if not all([s.smtp_host, s.smtp_username, s.smtp_password, s.alert_email_to]):
            return "not_configured"
        message = EmailMessage()
        message["Subject"] = f"Financial Lab预警 · {event.symbol} · {event.title}"
        message["From"] = s.smtp_from or s.smtp_username
        message["To"] = s.alert_email_to
        message.set_content(self._message(event, review))
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(s.smtp_host, s.smtp_port, context=context, timeout=15) as server:
            server.login(s.smtp_username, s.smtp_password)
            server.send_message(message)
        return "sent"

    async def send_email(self, event: MarketEvent, review: dict[str, Any] | None) -> str:
        return await asyncio.to_thread(self._send_email_sync, event, review)

    async def send_high_priority(self, event: MarketEvent, review: dict[str, Any] | None) -> dict[str, str]:
        results = await asyncio.gather(
            self.send_wecom(event, review),
            self.send_email(event, review),
            return_exceptions=True,
        )
        channels = ("wecom", "email")
        return {
            channel: (f"error:{type(result).__name__}" if isinstance(result, Exception) else result)
            for channel, result in zip(channels, results)
        }

