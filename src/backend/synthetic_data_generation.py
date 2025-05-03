"""
Banking Persona Data Generator  ──  “Spotify Wrapped for Banking” demo
Fixed version – May 2025
---------------------------------------------------------------
• Requires:  openai>=1.13.3, pandas
• Set your key in the env var OPENAI_API_KEY  *or*  pass it explicitly.
"""

import csv
import json
import os
import time
from datetime import datetime
from typing import List, Dict

import pandas as pd
from openai import OpenAI

# ────────────────────────────────────────────────────────────────
# Configuration ─ adjust to taste
# ────────────────────────────────────────────────────────────────
MODEL_NAME = "gpt-4o-mini"
BATCH_SIZE = 10           # 5-20 works fine; keep the JSON small
ROWS_IN_FULL_DATASET = 100
DATE_RANGE = ("2025-04-01", "2025-06-30")

# ────────────────────────────────────────────────────────────────
# Static data: 8 personas and matching user profiles
# ────────────────────────────────────────────────────────────────
personas: Dict[int, Dict[str, str]] = {
    1: {"name": "The Budgeting Maestro",   "character": "Maestro Moolah",
        "description": "Meticulously plans every expense, tracks budgets diligently, and always knows where every cent goes."},
    2: {"name": "The Spontaneous Spender", "character": "Flashy Fin",
        "description": "Lives in the moment, often making impulsive purchases for instant gratification."},
    3: {"name": "The Cautious Saver",      "character": "Penny the Penguin",
        "description": "Prioritizes saving over spending, often setting aside funds for future security."},
    4: {"name": "The Investment Enthusiast", "character": "Bullish Benny",
        "description": "Always looking for opportunities to grow wealth through various investments."},
    5: {"name": "The Deal Hunter",         "character": "Bargain Buzzy",
        "description": "Always on the lookout for discounts, coupons, and the best deals."},
    6: {"name": "The Minimalist",          "character": "Zen Zeke",
        "description": "Prefers simplicity, avoids unnecessary expenses, and values experiences over possessions."},
    7: {"name": "The Generous Giver",      "character": "Charity Charlie",
        "description": "Frequently donates to causes, helps friends in need, and values sharing wealth."},
    8: {"name": "The Financial Adventurer", "character": "Explorer Ellie",
        "description": "Explores new financial tools, apps, and unconventional methods to manage money."}
}

user_profiles: Dict[int, str] = {
    1: "Martijn de Vries, 42, Dutch financial analyst",
    2: "Sofia Patel, 28, British-Indian marketing executive",
    3: "Lars Jensen, 35, Danish programmer living in Utrecht",
    4: "Mei Lin, 31, Chinese-Dutch investment advisor",
    5: "Fatima El-Haddad, 29, Moroccan-Dutch teacher",
    6: "Johannes Weber, 40, German architect based in Amsterdam",
    7: "Isabella Rossi, 37, Italian chef with a restaurant in Rotterdam",
    8: "Thijs van der Meer, 26, Dutch tech entrepreneur"
}

# ────────────────────────────────────────────────────────────────
# OpenAI client
# ────────────────────────────────────────────────────────────────
client = OpenAI()  # uses OPENAI_API_KEY from the environment


# ────────────────────────────────────────────────────────────────
# Helper: one batch of synthetic transactions
# ────────────────────────────────────────────────────────────────
def generate_batch(persona_id: int, num_rows: int) -> List[Dict]:
    persona = personas[persona_id]
    profile = user_profiles[persona_id]

    system_msg = (
        "You generate realistic—but entirely fictitious—bank transactions. "
        "Return **only** valid JSON exactly matching the schema I provide."
    )

    prompt = f"""
Create {num_rows} Dutch banking transactions in an object attribute called "transactions".
Strict rules:
• All dates between {DATE_RANGE[0]} and {DATE_RANGE[1]} (inclusive).
• Each item has the keys:
  - "Timestamp"  (YYYY-MM-DD HH:MM:SS, 24h)  
  - "Merchant"   (string)                     
  - "Amount"     (float, 2 decimals, EUR, signed (+ for money coming in, - for money going out.))     
  - "Description"(≤3 words)                   
  - "Location"   (city)                       
  - "Category"   (groceries, food, entertainment, rent, health, finance, personal, subscriptions, others)
  - "Account"    (logical account name)       
• Reflect this persona’s style:

Persona: {persona['name']}  ({persona['character']})
Description: {persona['description']}
User profile: {profile}
Return JSON only: {{ "transactions": [ … ] }}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        response_format={"type": "json_object"},   # guarantees valid JSON
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )

    obj = json.loads(response.choices[0].message.content)
    return obj.get("transactions", [])


# ────────────────────────────────────────────────────────────────
# Build full dataset in multiple batches
# ────────────────────────────────────────────────────────────────
def generate_full_dataset(persona_id: int, total_rows: int = ROWS_IN_FULL_DATASET,
                           batch_size: int = BATCH_SIZE) -> List[Dict]:
    all_rows: List[Dict] = []
    batches = (total_rows + batch_size - 1) // batch_size

    for batch_idx in range(batches):
        rows_needed = min(batch_size, total_rows - len(all_rows))
        print(f"• Batch {batch_idx + 1}/{batches} … ", end="", flush=True)

        try:
            batch_rows = generate_batch(persona_id, rows_needed)
            if not batch_rows:
                raise ValueError("empty batch")
            all_rows.extend(batch_rows)
            print(f"OK  ({len(batch_rows)} rows)")
        except Exception as exc:
            print(f"FAILED  → {exc}")
            # brief backoff, then try the batch again once
            time.sleep(2)
            continue

        # polite pacing
        time.sleep(1.5)

    return all_rows[:total_rows]   # trim in case we got extra rows


# ────────────────────────────────────────────────────────────────
# Save helper
# ────────────────────────────────────────────────────────────────
def save_to_csv(rows: List[Dict], persona_id: int) -> str:
    persona = personas[persona_id]
    filename = f"{persona['character'].replace(' ', '_')}_{datetime.now():%Y%m%d_%H%M%S}.csv"

    if not rows:
        raise ValueError("No rows to write – aborting CSV save.")

    with open(filename, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=["Timestamp", "Merchant", "Amount", "Description",
                        "Location", "Category", "Account"]
        )
        writer.writeheader()
        writer.writerows(rows)

    return filename


# ────────────────────────────────────────────────────────────────
# CLI driver
# ────────────────────────────────────────────────────────────────
def main() -> None:
    print("=" * 70)
    print("Banking Persona Data Generator")
    print("=" * 70)

    # list personas
    for pid, p in personas.items():
        print(f"{pid}: {p['name']}  –  {p['character']}")

    # user picks one
    while True:
        try:
            choice = int(input("\nPick a persona (1-8): "))
            if 1 <= choice <= 8:
                break
        except ValueError:
            pass
        print("→ Enter a number between 1 and 8.")

    # small sample first
    print("\nGenerating a small sample (5 rows) …")
    sample = generate_batch(choice, 5)
    print(pd.DataFrame(sample), "\n")

    cont = input("Generate full 100-row dataset? (y/n): ").lower()
    if cont != "y":
        print("Cancelled.")
        return

    print("\nBuilding full dataset…")
    full = generate_full_dataset(choice, ROWS_IN_FULL_DATASET)
    print(f"\nTotal rows: {len(full)}")

    if full:
        print(pd.DataFrame(full[:7]))   # peek at first few

        filename = save_to_csv(full, choice)
        print(f"\n✅  Saved to {filename}")
    else:
        print("⚠️  No data generated – nothing saved.")


if __name__ == "__main__":
    main()
