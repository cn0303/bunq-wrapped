import os
from flask import Flask, jsonify
from datetime import datetime, timedelta
from collections import Counter
import re

# bunq SDK imports
from bunq.sdk.context.api_context import ApiContext
from bunq.sdk.context.bunq_context import BunqContext
from bunq.sdk.model.generated.endpoint import PaymentApiObject
from bunq import Pagination
from bunq import ApiEnvironmentType
from bunq.sdk.model.generated.endpoint import PaymentApiObject
from bunq.sdk.model.generated.object_ import AmountObject, PointerObject
from bunq.sdk.model.generated.endpoint import RequestInquiryApiObject
from bunq.sdk.model.generated.endpoint import RequestResponseApiObject
from bunq.sdk.model.generated.object_ import AmountObject

# OpenAI NVIDIA integration
from openai import OpenAI

# Configuration defaults
default_limits = {
    'transactions_page_size': 100,
    'history_months': 12
}

# Load environment variables
BUNQ_ENV = os.getenv('BUNQ_ENV', 'SANDBOX')
BUNQ_API_KEY = os.getenv('BUNQ_API_KEY')  # Replace with your bunq API key
OPENAI_API_KEY = os.getenv('NVIDIA_RIVA_TOKEN')  # reused for NVIDIA integration
OPENAI_BASE_URL = os.getenv('OPENAI_BASE_URL')
CONTEXT_FILE = os.getenv('BUNQ_CONTEXT_FILE', 'bunq_api_context.conf')

# Initialize OpenAI client pointing to NVIDIA endpoint
openai_client = OpenAI(
    base_url=OPENAI_BASE_URL,
    api_key=OPENAI_API_KEY
)

import json

def classify_transactions(txns: list) -> list:
    for t in txns:
        merchant_name = t['merchant']
        resp = openai_client.chat.completions.create(
            model="nvidia/llama-3.1-nemotron-70b-instruct",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a specialized transaction‐classification assistant. "
                        "Your job is to map a merchant name into one of these categories:\n\n"
                        "  • groceries: supermarkets, food markets, grocery-delivery services\n"
                        "  • entertainment: streaming services, cinemas, concerts, subscriptions\n"
                        "  • utilities: electricity, water, internet, phone, rent\n"
                        "  • transport: fuel, tolls, public transit, ride-hailing\n"
                        "  • other: anything not covered above\n\n"
                        "For each merchant, respond *only* with a JSON object with exactly two keys:\n"
                        "  {\n"
                        "    \"category\": <one of the five above>,\n"
                        "    \"reasoning\": <a single sentence explaining why>\n"
                        "  }\n\n"
                        "Do NOT include any additional text, markdown, or formatting. "
                        "If the merchant isn’t clearly in one of the first four, choose \"other.\""
                        "\n\nExample:\n"
                        "Input: “Shell”\n"
                        "Output: {\"category\": \"transport\", \"reasoning\": \"Shell is a fuel station chain.\"}"
                    )
                },
                {
                    "role": "user",
                    "content": f"Merchant: {merchant_name}"
                }
            ],
            temperature=0.0,
            top_p=1,
            max_tokens=1024,
        )

        raw = resp.choices[0].message.content.strip()
        result = json.loads(raw)
        t['category'] = result['category']
        t['reasoning'] = result['reasoning']

    return txns


txns = [
    {
        'merchant': 'Albert Heijn',
        'amount': 50.0,
        'date': '2023-10-01',
        'description' : 'Groceries',
    },
    {
        'merchant': 'Shell',
        'amount': 30.0,
        'date': '2023-10-02',
        'description' : 'Fuel',
    },
    {
        'merchant': 'Bol.com',
        'amount': 20.0,
        'date': '2023-10-03',
        'description' : 'Online Shopping',
    },
    {
        'merchant': 'KPN',
        'amount': 40.0,
        'date': '2023-10-04',
        'description' : 'Utilities',
    },
    {
        'merchant': 'NS',
        'amount': 15.0,
        'date': '2023-10-05',
        'description' : 'Transport',
    },
    {
        'merchant': 'Unknown Merchant',
        'amount': 100.0,
        'date': '2023-10-06',
        'description' : 'Miscellaneous',
    },
    {
        'merchant': 'Spotify',
        'amount': 10.0,
        'date': '2023-10-07',
        'description' : 'Entertainment',
    }
]

if __name__ == '__main__':
    classified_txns = classify_transactions(txns)
    print(classified_txns)
