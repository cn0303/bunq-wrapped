# Flask-based bunq Memories API with OpenAI Client NVIDIA Integration
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
import json
from collections import Counter, defaultdict
from datetime import datetime
import statistics

import csv
from typing import List, Dict
from flask_cors import CORS

# OpenAI NVIDIA integration
from openai import OpenAI

import html
import re
import ast

# Configuration defaults
default_limits = {
    'transactions_page_size': 200,
    'history_months': 12
}

# Initialize Flask app
app = Flask(__name__)
CORS(app)
# Load environment variables
BUNQ_ENV = os.getenv('BUNQ_ENV', 'SANDBOX')
BUNQ_API_KEY = os.getenv('BUNQ_API_KEY') 
OPENAI_API_KEY = os.getenv('NVIDIA_RIVA_TOKEN') 
OPENAI_BASE_URL = os.getenv('OPENAI_BASE_URL', 'https://integrate.api.nvidia.com/v1')
CONTEXT_FILE = os.getenv('BUNQ_CONTEXT_FILE', 'bunq_api_context.conf')

USE_API_FOR_DATA = os.getenv('USE_API_FOR_DATA', 'false').lower() == 'true'
CSV_BASE_FILE_PATH = os.getenv('CSV_BASE_FILE_PATH', '../data/')

# Debug prints
def debug_env():
    print(f"BUNQ_ENV: {BUNQ_ENV}")
    print(f"BUNQ_API_KEY: {BUNQ_API_KEY}")
    print(f"OPENAI_API_KEY: {OPENAI_API_KEY}")
    print(f"OPENAI_BASE_URL: {OPENAI_BASE_URL}")
    print(f"CONTEXT_FILE: {CONTEXT_FILE}")

debug_env()

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
    api_context.save(CONTEXT_FILE)
else:
    api_context = ApiContext.restore(CONTEXT_FILE)
BunqContext.load_api_context(api_context)

import os
from datetime import datetime, timedelta

from bunq.sdk.model.generated.endpoint import (
    MonetaryAccountBankApiObject,
    PaymentApiObject,
)

# Configuration defaults
default_limits = {
    'history_months': 12
}

personas = {
    1: {"name": "The Budgeting Maestro",     "character": "Maestro_Moolah",
        "description": "Meticulously plans every expense, tracks budgets diligently, and always knows where every cent goes."},
    2: {"name": "The Spontaneous Spender",   "character": "Flashy_Fin",
        "description": "Lives in the moment, often making impulsive purchases for instant gratification."},
    3: {"name": "The Cautious Saver",        "character": "Penny_the_Penguin",
        "description": "Prioritizes saving over spending, often setting aside funds for future security."},
    4: {"name": "The Investment Enthusiast", "character": "Bullish_Benny",
        "description": "Always looking for opportunities to grow wealth through various investments."},
    5: {"name": "The Deal Hunter",           "character": "Bargain_Buzzy",
        "description": "Always on the lookout for discounts, coupons, and the best deals."},
    6: {"name": "The Minimalist",            "character": "Zen_Zeke",
        "description": "Prefers simplicity, avoids unnecessary expenses, and values experiences over possessions."},
    7: {"name": "The Generous Giver",        "character": "Charity_Charlie",
        "description": "Frequently donates to causes, helps friends in need, and values sharing wealth."},
    8: {"name": "The Financial Adventurer",  "character": "Explorer_Ellie",
        "description": "Explores new financial tools, apps, and unconventional methods to manage money."}
}

def fetch_transactions(user_id: str = None) :
    """
        Fetch & classify transactions for a given user_id.
        If USE_API_FOR_DATA=True, pull from the bunq API (you could also
        pass user_id down to filter). Otherwise, read from CSV at:
        ../data/{user_id}.csv
    """
    if USE_API_FOR_DATA:
        cleaned = fetch_transactions_from_api()
        categorized = classify_transactions(cleaned)
        return categorized
    else:
        file_name = personas[int(user_id)]['character'] + ".csv"
        categorized = fetch_transactions_from_csv(
            file_path=CSV_BASE_FILE_PATH + file_name,
            header_mapping={
                'date': 'Timestamp',
                'merchant': 'Merchant',
                'amount': 'Amount',
                'description': 'Description',
                'category': 'Category',
                'account_name': 'Account'
            }
        )
        return categorized

def fetch_transactions_from_api(months: int = default_limits['history_months']) -> list:
    """
    Fetch the most recent page of payments for every bank account
    over the past `months` months (no pagination), then preprocess
    them—including the account name.
    """
    since = (datetime.utcnow() - timedelta(days=30 * months)).isoformat()
    all_payments = []

    # 1) List all bank accounts
    accounts = MonetaryAccountBankApiObject.list().value

    for acct in accounts:
        acct_id = acct.id_
        # — you may need to adjust this to however your SDK surface exposes the account name:
        account_name = acct._description

        # 2) Single‐page fetch for this account
        payments = PaymentApiObject.list(
            monetary_account_id=acct_id,
            params={'older_than': since}
        ).value

        # 3) Preprocess, injecting account_name
        cleaned = preprocess(payments, account_name)
        all_payments.extend(cleaned)

    return all_payments


def preprocess(payments: list, account_name: str) -> list:
    """
    Turn raw PaymentApiObject instances into clean dicts and
    tack on the account_name.
    """
    clean = []
    for p in payments:
        desc_raw = p.description or ''
        desc = re.sub(r"[^\w\s]", "", desc_raw).strip().lower()

        # counterparty alias pointer (adjust if your SDK is different)
        cpty = p.counterparty_alias.pointer.name  

        # parse amount
        try:
            amt = float(p.amount.value)
        except (ValueError, AttributeError):
            continue

        # normalize date
        date = p.created.split("T")[0]

        clean.append({
            "date":         date,
            "merchant":     cpty,
            "amount":       amt,
            "description":  desc,
            "account_name": account_name
        })

    return clean

def classify_transactions(txns: list) -> list:
    for t in txns:
        merchant_name = t['merchant']
        resp = openai_client.chat.completions.create(
            model="nvidia/llama-3.1-nemotron-70b-instruct",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a specialized transaction-classification assistant. "
                        "Your job is to map a merchant name into one of these categories:\n\n"
                        "  • groceries: supermarkets, food markets, grocery-delivery services\n"
                        "  • food: dineout, fast food, restaurants\n"
                        "  • entertainment: streaming services, cinemas, concerts, subscriptions\n"
                        "  • utilities: electricity, water, internet, phone, rent\n"
                        "  • transport: fuel, tolls, public transit, ride-hailing\n"
                        "  • travel: hotels, flights, car rentals, travel agencies\n"
                        "  • health: pharmacies, hospitals, clinics, health insurance\n"
                        " • rent and mortgage: rent, mortgage payments, property taxes\n"
                        " • education: tuition, courses, books, educational services\n"
                        " • finance: banks, loans, investments, insurance\n"
                        " • personal: clothing, beauty, hair, personal care\n"
                        " • shopping: online stores, retail, e-commerce\n"
                        " • savings: savings accounts, investments, retirement\n"
                        " • business: business expenses, office supplies, services\n"
                        " • gifts: gifts, donations, charity\n"
                        " • subscriptions: monthly or yearly subscriptions\n"
                        " • cash: ATM withdrawals, cash deposits\n"
                        " • pets: pet care, veterinary services, pet supplies\n"
                        "  • other: anything not covered above\n\n"
                        "For each merchant, respond *only* with a JSON object with exactly two keys:\n"
                        "  {\n"
                        "    \"category\": <one of the above catgeories>,\n"
                        "    \"reasoning\": <a single sentence explaining why>\n"
                        "  }\n\n"
                        "Do NOT include any additional text, markdown, or formatting. "
                        "Make sure to use the exact category names as listed above. "
                        "Make sure you definitely only include one of the above categories and be decisive. "
                        "If the merchant isn't clearly in one of the first four, choose \"other.\""
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
            max_tokens=8192,
        )

        raw = resp.choices[0].message.content.strip()
        print(f"Merchant: {merchant_name}, Response: {raw}")
        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            print(f"Failed to decode JSON for merchant: {merchant_name}, response: {raw}")
            continue
        t['category'] = result['category']
        t['reasoning'] = result['reasoning']

    return txns


# Utility: detect spending peaks
def detect_peaks(txns: list) -> list:
    monthly = {}
    for t in txns:
        m = t['date'][:7]
        monthly.setdefault(m, 0)
        monthly[m] += t['amount']
    sorted_months = sorted(monthly.items(), key=lambda x: x[1], reverse=True)
    return [m for m, _ in sorted_months[:2]]

def unescape_html(s: str) -> str:
    # return html.unescape(s)
    # json.loads will interpret \n, \uXXXX, \" etc.
    return json.loads(f'"{s}"')

def generate_year_in_review(txns: list) -> str:
    """
    Given a list of transaction dicts (with date, merchant, amount, description, category),
    produce a concise “Year in Review” narrative summarizing spending trends,
    top categories, and memorable highlights.
    """
    # 1) Turn your list into a compact JSON string
    txns_json = json.dumps(txns, ensure_ascii=False)

    # 2) Build system + user prompts
    system_prompt = (
        "You are a financial analyst crafting an engaging, concise “Year in Review” narrative. "
        "You'll be given a JSON array of transactions, each with date, merchant, amount, description, and category. "
        "Summarize total spending, highlight top 3 categories by spend, call out any notable merchants or patterns, "
        "and wrap up with an overall reflection. "
        "Write in 1-2 short paragraphs."
        "Use a friendly, conversational tone. And keep it concise! "
        "Avoid jargon and technical terms. "
    )
    user_prompt = (
        f"Here are my transactions for the past year:\n\n"
        f"{txns_json}\n\n"
        "Please write the “Year in Review” narrative as described."
    )

    # 3) Call the NVIDIA Llama endpoint
    resp = openai_client.chat.completions.create(
        model="nvidia/llama-3.1-nemotron-70b-instruct",
        temperature=0.0,
        top_p=1,
        max_tokens=1024,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt}
        ]
    )

    # 4) Extract and return the generated narrative
    result = resp.choices[0].message.content.strip()
    # Unescape HTML entities
    return unescape_html(result)

def generate_conversation_points(txns: list) -> dict:
    """
    Returns:
      {
        "conversationPoints": [...],
        "persona_id": <int>,
        "persona_scores": { "1":0.05, "2":0.20, …, "8":0.03 }
      }
    """
    txns_json   = json.dumps(txns, ensure_ascii=False)
    persona_list = "\n".join(
        f"{pid}. {p['name']} (\"{p['character']}\"): {p['description']}"
        for pid, p in personas.items()
    )

    system_prompt = (
        "You are a financial coach. Here are 8 possible personas:\n\n"
        f"{persona_list}\n\n"
        "Based on the user's transaction history and spending patterns, choose exactly one persona ID.\n\n"
        "Then return only a JSON object with three keys:\n"
        "  \"conversationPoints\": an array of 4-6 short, actionable strings,\n"
        "  \"persona_id\": the single chosen ID (integer 1-8),\n"
        "  \"persona_scores\": an index based array with each persona confidence score (number between 0 and 1) at the index corresponding to their id-1 that sums to 1.0 only. DO NOT ADD ANY COMMENTS ON THE PERSONA IT RESOLVES TO\n\n"
        "Do not output any extra text, bullets, markdown, or code fences—just the raw JSON."
    )

    user_prompt = (
        f"Here are my transactions for the past year:\n\n"
        f"{txns_json}\n\n"
        "Generate the JSON as specified."
    )

    resp = openai_client.chat.completions.create(
        model="nvidia/llama-3.1-nemotron-70b-instruct",
        temperature=0.0,
        top_p=1,
        max_tokens=1024,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt}
        ]
    )

    raw = resp.choices[0].message.content.strip()

    # Strip any accidental ``` fences
    if raw.startswith("```"):
        raw = "\n".join(l for l in raw.splitlines() if not l.strip().startswith("```")).strip()

    # Fix mis-encoded Unicode if needed
    try:
        raw = raw.encode('latin-1').decode('utf-8')
    except:
        pass

    return json.loads(raw)


def compute_metrics(txns):
    # Total number of transactions
    total_count = len(txns)
    # Total absolute spend (for % splits)
    total_spend = sum(abs(t['amount']) for t in txns)

    # 1) categories: count, % of txns, average amount
    cat_amounts = defaultdict(list)
    for t in txns:
        cat_amounts[t['category']].append(abs(t['amount']))

    categories = {}
    for cat, amounts in cat_amounts.items():
        count = len(amounts)
        pct   = round(count / total_count * 100)
        avg   = round(statistics.mean(amounts))
        categories[cat] = {
            'percentage': pct,
            'count':      count,
            'averageInArea': avg
        }

    # 2) topMerchants: top 3 by visit count, include category
    merchant_counts = Counter(t['merchant'] for t in txns)
    # assume each merchant always maps to a single category:
    merchant_cat = {t['merchant']: t['category'] for t in txns}

    topMerchants = []
    for name, visits in merchant_counts.most_common(3):
        topMerchants.append({
            'name':     name,
            'category': merchant_cat[name],
            'visits':   visits
        })

    # 3) spendingBreakdown: % split between “experiences” vs “essentials”
    # adjust these sets however you like
    experiences = {'food', 'entertainment', 'travel', 'personal', 'shopping', 'gifts', 'subscriptions', 'pets'}
    exp_spend = sum(abs(t['amount']) for t in txns if t['category'] in experiences)
    ess_spend = total_spend - exp_spend

    spendingBreakdown = {
        'experiences': round(exp_spend / total_spend * 100),
        'essentials':  round(ess_spend / total_spend * 100)
    }

    # 4) weekdaySpending: total spend by weekday name
    weekday_map = {
        0: 'monday', 1: 'tuesday', 2: 'wednesday',
        3: 'thursday',4: 'friday',    5: 'saturday',
        6: 'sunday'
    }
    weekdaySpending = {name: 0 for name in weekday_map.values()}
    for t in txns:
        dt = datetime.fromisoformat(t['date'])
        wd = weekday_map[dt.weekday()]
        weekdaySpending[wd] += abs(t['amount']) if t['amount'] < 0 else 0 # only count spending

    return {
        'categories':        categories,
        'topMerchants':      topMerchants,
        'spendingBreakdown': spendingBreakdown,
        'weekdaySpending':   weekdaySpending
    }

# Pipeline orchestration
def run_memories_pipeline(user_id: str = None):
    categorized = fetch_transactions(user_id)
    counts = Counter(t['category'] for t in categorized)
    top_cats = counts.most_common(5)
    peaks = detect_peaks(categorized)
    metrics = compute_metrics(categorized)
    # narrative = generate_year_in_review(categorized)
    result = generate_conversation_points(categorized)

    persona_id = result['persona_id']
    conversationPoints = result['conversationPoints']
    persona_scores = result['persona_scores']
    persona = personas[persona_id]['name']

    merged = {**metrics, "financialPersonality" : persona, "conversationPoints": conversationPoints, "persona_id": persona_id, "persona_scores": persona_scores}

    return merged

def fetch_transactions_from_csv(
    file_path: str,
    header_mapping: Dict[str, str]
) -> List[Dict]:
    """
    Read transactions from a CSV file and map its columns
    into your standard keys. All mapped fields are required.

    Args:
        file_path: path to the CSV file.
        header_mapping: dict mapping your internal key names
            to CSV column headers. Must include:
            'date', 'merchant', 'amount', 'description',
            'category', 'account_name'.

    Returns:
        List of dicts with keys: date, merchant, amount,
        description, category, account_name.
    """
    required_keys = [
        'date', 'merchant', 'amount',
        'description', 'category', 'account_name'
    ]
    # Ensure header_mapping covers all keys
    missing = [k for k in required_keys if k not in header_mapping]
    if missing:
        raise KeyError(f"Header mapping missing required keys: {missing}")

    txns = []
    with open(file_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, start=1):
            try:
                # Extract and strip every field
                date_str       = row[header_mapping['date']].strip()
                merchant       = row[header_mapping['merchant']].strip()
                amount_raw     = row[header_mapping['amount']].strip()
                description    = row[header_mapping['description']].strip()
                category       = row[header_mapping['category']].strip()
                account_name   = row[header_mapping['account_name']].strip()

                # Validate non-empty
                if not all([date_str, merchant, amount_raw, description, category, account_name]):
                    raise ValueError("Empty value in required field")

                # Parse amount
                amount = float(amount_raw)

            except KeyError as e:
                raise KeyError(f"CSV missing expected column '{e.args[0]}' on row {i}")
            except ValueError as ve:
                raise ValueError(f"Invalid data on row {i}: {ve}")

            txns.append({
                'date':         date_str,
                'merchant':     merchant,
                'amount':       amount,
                'description':  description,
                'category':     category,
                'account_name': account_name
            })

    return txns

# API Endpoints
@app.route('/memories/summary/<string:user_id>', methods=['GET'])
def get_memories_summary(user_id):
    try:
        data = run_memories_pipeline(user_id=user_id)
        print(data)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/memories/transactions/<string:user_id>', methods=['GET'])
def get_memories_transactions_for_user(user_id):
    try:
        categorized = fetch_transactions(user_id=user_id)
        return jsonify(categorized)
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5001)))
