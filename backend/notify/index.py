import os
import json
import urllib.request
import urllib.parse


def handler(event: dict, context) -> dict:
    """Отправка заявок от Robot Seller в Telegram (покупка валюты, подписка, пополнение)."""

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    body = json.loads(event.get("body") or "{}")

    request_type = body.get("type", "unknown")
    name = body.get("name", "—")
    phone = body.get("phone", "—")
    email = body.get("email", "—")
    amount = body.get("amount", "—")
    comment = body.get("comment", "—")
    tariff = body.get("tariff", "—")
    currency = body.get("currency", "—")
    currency_amount = body.get("currency_amount", "—")
    company = body.get("company", "—")

    if request_type == "deposit":
        text = (
            "💰 *Заявка на пополнение баланса*\n\n"
            f"👤 Имя: {name}\n"
            f"📞 Телефон: {phone}\n"
            f"💵 Сумма: {amount} USDT\n"
            f"💬 Комментарий: {comment}"
        )
    elif request_type == "buy_currency":
        text = (
            "🪙 *Заявка на покупку валюты*\n\n"
            f"👤 Имя: {name}\n"
            f"📞 Телефон: {phone}\n"
            f"🔤 Валюта: {currency}\n"
            f"💵 Сумма покупки: {currency_amount} USDT\n"
            f"💬 Комментарий: {comment}"
        )
    elif request_type == "subscription":
        text = (
            "⭐ *Заявка на подписку*\n\n"
            f"👤 Имя: {name}\n"
            f"📧 Email: {email}\n"
            f"📞 Телефон: {phone}\n"
            f"📋 Тариф: {tariff}\n"
            f"🏢 Компания: {company}"
        )
    else:
        text = (
            "📩 *Новая заявка Robot Seller*\n\n"
            f"👤 Имя: {name}\n"
            f"📞 Телефон: {phone}\n"
            f"💬 Комментарий: {comment}"
        )

    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as resp:
        resp_data = json.loads(resp.read())

    if not resp_data.get("ok"):
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Telegram API error"}),
        }

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"ok": True}),
    }
