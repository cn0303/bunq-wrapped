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
from bunq.sdk.model.generated.endpoint import RequestResponseApiObject, MonetaryAccountApiObject, MonetaryAccountBankApiObject
from bunq.sdk.model.generated.object_ import AmountObject
from bunq.sdk.model.generated.object_ import GeolocationObject, ShareDetailObject, MonetaryAccountReference
from bunq.sdk.model.generated.endpoint import CardDebitApiObject
from bunq.sdk.model.generated.object_ import CardPinAssignmentObject
from bunq.sdk.context.bunq_context import BunqContext

# OpenAI NVIDIA integration
from openai import OpenAI
import json

# Configuration defaults
default_limits = {
    'transactions_page_size': 100,
    'history_months': 12
}

# Initialize Flask app
app = Flask(__name__)

# Load environment variables
BUNQ_ENV = os.getenv('BUNQ_ENV', 'SANDBOX')
BUNQ_API_KEY = os.getenv('BUNQ_API_KEY')  # Replace with your bunq API key
OPENAI_API_KEY = os.getenv('NVIDIA_RIVA_TOKEN')  # reused for NVIDIA integration
OPENAI_BASE_URL = os.getenv('OPENAI_BASE_URL')
CONTEXT_FILE = os.getenv('BUNQ_CONTEXT_FILE', 'bunq_api_context.conf')

# Debug prints
def debug_env():
    print(f"BUNQ_ENV: {BUNQ_ENV}")
    print(f"BUNQ_API_KEY: {BUNQ_API_KEY}")
    print(f"OPENAI_API_KEY: {OPENAI_API_KEY}")
    print(f"OPENAI_BASE_URL: {OPENAI_BASE_URL}")
    print(f"CONTEXT_FILE: {CONTEXT_FILE}")

debug_env()
counterparty_alias=PointerObject("EMAIL", "sugardaddy@bunq.com")

if not BUNQ_API_KEY or not OPENAI_API_KEY:
    raise RuntimeError("Please set BUNQ_API_KEY and NVIDIA_RIVA_TOKEN environment variables")

# Initialize OpenAI client pointing to NVIDIA endpoint
openai_client = OpenAI(
    base_url=OPENAI_BASE_URL,
    api_key=OPENAI_API_KEY
)

# Initialize bunq context
if not os.path.exists(CONTEXT_FILE):
    api_context = ApiContext.create(
        ApiEnvironmentType[BUNQ_ENV],
        BUNQ_API_KEY,
        'bunq-test1'
    )
    print(f"Created new API context: {api_context}")
    api_context.save(CONTEXT_FILE)
else:
    print(f"Loading existing API context from {CONTEXT_FILE}")
    api_context = ApiContext.restore(CONTEXT_FILE)
BunqContext.load_api_context(api_context)


# Access the user context
user_context = BunqContext.user_context()

# Get the user ID
user_id = user_context.user_id

# Get the primary monetary account
primary_account = user_context.primary_monetary_account

geolocation_data  = {
    "latitude": 52.379189,
    "longitude": 4.899431,
    "altitude": 1000,
    "radius": 4,
}
json_str = json.dumps(geolocation_data)
geolocation = GeolocationObject.from_json(json_str)

# # Create a payment request
# request_id = RequestInquiryApiObject.create(
#     AmountObject("8.00", "EUR"),
#     counterparty_alias,
#     "Please pay for dinner",
#     allow_bunqme=True,
#     # merchant_reference="Dinner with friends",
# ).value

# print(f"Payment request created with ID: {request_id}")

accounts = MonetaryAccountBankApiObject.list()


# Configuration defaults
default_limits = {
    'history_months': 12
}

def fetch_transactions(months: int = default_limits['history_months']) -> list:
    """
    Fetch the most recent page of payments for every bank account
    over the past `months` months (no pagination).
    """
    since = (datetime.utcnow() - timedelta(days=30 * months)).isoformat()
    all_payments = []

    # 1) List all bank accounts
    accounts = MonetaryAccountBankApiObject.list().value

    for acct in accounts:
        acct_id = acct.id_
        # 2) Single-page fetch for this account
        payments = PaymentApiObject.list(
            monetary_account_id=acct_id,
            params={'older_than': since}
        ).value
        # 3) Collect
        all_payments.extend(payments)

    return all_payments

payments = fetch_transactions(months=default_limits['history_months'])

# Display payments
for payment in payments:
    print(f"ID: {payment.id_}")
    print(f"Amount: {payment.amount.value} {payment.amount.currency}")
    print(f"Description: {payment.description}")
    print("---")

