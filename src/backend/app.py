from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import csv
import pandas as pd
from datetime import datetime
from openai import OpenAI

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize OpenAI client
client = OpenAI()

# Character personalities
PERSONAS = {
    "Budgeting Maestro": {
        "description": "Meticulously plans every expense, tracks budgets diligently, and always knows where every cent goes.",
        "character": "Maestro Moolah",
        "style": "Formal, precise, organized. Uses musical metaphors. Talks about orchestrating finances, creating harmonious budgets, and conducting financial symphonies.",
        "traits": "Wise, meticulous, disciplined, elegant, detailed"
    },
    "Spontaneous Spender": {
        "description": "Lives in the moment, often making impulsive purchases for instant gratification.",
        "character": "Flashy Fin",
        "style": "Energetic, playful, enthusiastic. Uses water and movement metaphors. Talks about making a splash, riding the wave of trends, and going with the flow.",
        "traits": "Impulsive, fun-loving, trend-conscious, optimistic, social"
    },
    "Cautious Saver": {
        "description": "Prioritizes saving over spending, often setting aside funds for future security.",
        "character": "Penny the Penguin",
        "style": "Careful, thoughtful, protective. Uses winter and storage metaphors. Talks about weathering financial storms, building nest eggs, and preserving resources.",
        "traits": "Prudent, patient, conservative, safety-oriented, long-term thinker"
    },
    "Investment Enthusiast": {
        "description": "Always looking for opportunities to grow wealth through various investments.",
        "character": "Bullish Benny",
        "style": "Confident, analytical, strategic. Uses market and growth metaphors. Talks about riding bull markets, diversifying portfolios, and cultivating financial growth.",
        "traits": "Bold, informed, ambitious, data-driven, growth-minded"
    },
    "Deal Hunter": {
        "description": "Always on the lookout for discounts, coupons, and the best deals.",
        "character": "Bargain Buzzy",
        "style": "Alert, enthusiastic, resourceful. Uses hunting and discovery metaphors. Talks about sniffing out deals, hunting for bargains, and collecting savings.",
        "traits": "Sharp-eyed, persistent, resourceful, proud of savings, value-conscious"
    },
    "Minimalist": {
        "description": "Prefers simplicity, avoids unnecessary expenses, and values experiences over possessions.",
        "character": "Zen Zeke",
        "style": "Calm, thoughtful, philosophical. Uses balance and nature metaphors. Talks about finding financial harmony, the richness of simplicity, and mindful spending.",
        "traits": "Peaceful, intentional, content, mindful, experience-focused"
    },
    "Generous Giver": {
        "description": "Frequently donates to causes, helps friends in need, and values sharing wealth.",
        "character": "Charity Charlie",
        "style": "Warm, compassionate, community-minded. Uses sharing and connection metaphors. Talks about nurturing communities, planting seeds of generosity, and the ripple effects of giving.",
        "traits": "Kind-hearted, empathetic, community-focused, purposeful, generous"
    },
    "Financial Adventurer": {
        "description": "Explores new financial tools, apps, and unconventional methods to manage money.",
        "character": "Explorer Ellie",
        "style": "Curious, innovative, adaptable. Uses exploration and discovery metaphors. Talks about charting financial territories, navigating money frontiers, and pioneering smart approaches.",
        "traits": "Tech-savvy, open-minded, innovative, flexible, forward-thinking"
    }
}

# Character to filename mapping
CHARACTER_FILES = {
    "Maestro Moolah": "Maestro_Moolah.csv",
    "Flashy Fin": "Flashy_Fin.csv",
    "Penny the Penguin": "Penny_the_Penguin.csv",
    "Bullish Benny": "Bullish_Benny.csv",
    "Bargain Buzzy": "Bargain_Buzzy.csv",
    "Zen Zeke": "Zen_Zeke.csv",
    "Charity Charlie": "Charity_Charlie.csv",
    "Explorer Ellie": "Explorer_Ellie.csv"
}

# Function to load transaction data for a character
def load_transactions(character):
    filename = CHARACTER_FILES.get(character)
    if not filename:
        return []
    
    try:
        file_path = os.path.join(os.path.dirname(__file__), 'data', filename)
        transactions = []
        
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                transactions.append({
                    'timestamp': row.get('Timestamp', ''),
                    'merchant': row.get('Merchant', ''),
                    'amount': float(row.get('Amount', 0)),
                    'description': row.get('Description', ''),
                    'location': row.get('Location', ''),
                    'category': row.get('Category', ''),
                    'account': row.get('Account', '')
                })
        
        return transactions
    except Exception as e:
        print(f"Error loading transactions: {e}")
        return []

# Function to analyze transactions for insights
def analyze_transactions(transactions):
    if not transactions:
        return {}
    
    # Convert to DataFrame for easier analysis
    df = pd.DataFrame(transactions)
    
    # Basic stats
    try:
        total_spent = float(df[df['amount'] < 0]['amount'].sum()) * -1
        total_income = float(df[df['amount'] > 0]['amount'].sum())
        
        # Category breakdown
        category_spend = df[df['amount'] < 0].groupby('category')['amount'].sum() * -1
        category_percentage = (category_spend / total_spent * 100).to_dict()
        
        # Top merchants
        merchant_spend = df[df['amount'] < 0].groupby('merchant')['amount'].sum() * -1
        top_merchants = merchant_spend.sort_values(ascending=False).head(5).to_dict()
        
        # Monthly spending trend
        df['month'] = pd.to_datetime(df['timestamp']).dt.strftime('%Y-%m')
        monthly_spend = df[df['amount'] < 0].groupby('month')['amount'].sum() * -1
        monthly_trend = monthly_spend.to_dict()
        
        return {
            'total_spent': round(total_spent, 2),
            'total_income': round(total_income, 2),
            'category_percentage': {k: round(v, 2) for k, v in category_percentage.items()},
            'top_merchants': {k: round(v, 2) for k, v in top_merchants.items()},
            'monthly_trend': {k: round(v, 2) for k, v in monthly_trend.items()}
        }
    except Exception as e:
        print(f"Error analyzing transactions: {e}")
        return {}

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        character = data.get('character', 'Explorer Ellie')
        persona_type = data.get('persona', 'Financial Adventurer')
        
        # Get persona details
        persona = PERSONAS.get(persona_type, PERSONAS["Financial Adventurer"])
        
        # Load all transactions
        transactions = load_transactions(character)
        transaction_data = ""
        
        # Format ALL transactions for context
        if transactions:
            transaction_data = "FULL TRANSACTION HISTORY:\n"
            for txn in transactions:
                transaction_data += f"{txn['timestamp']} | {txn['merchant']} | €{txn['amount']:.2f} | {txn['category']} | {txn['description']} | {txn['location']}\n"
            
            # Add insights at the end
            insights = analyze_transactions(transactions)
            if insights:
                transaction_data += f"\nSUMMARY INSIGHTS:\n"
                transaction_data += f"Total spent: €{insights['total_spent']:.2f}\n"
                transaction_data += f"Total income: €{insights['total_income']:.2f}\n"
                transaction_data += f"Category breakdown: {json.dumps(insights['category_percentage'])}\n"
                transaction_data += f"Top merchants: {json.dumps(insights['top_merchants'])}\n"
        
        # Format context for the API
        system_prompt = f"""
        You are {character}, a {persona_type} character who gives financial advice.
        
        Character traits: {persona['traits']}
        Communication style: {persona['style']}
        
        You have access to the user's complete transaction history:
        
        {transaction_data}
        
        When answering questions about transactions, refer to this actual data with specific amounts,
        dates, merchants, and categories. Calculate figures if needed to answer queries accurately.
        
        Your responses should embody this character's personality and communication style.
        Keep responses concise (under 150 words) and engaging.
        
        Add occasional character actions in *asterisks* for personality.
        """
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="o3-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
        )
        
        bot_response = response.choices[0].message.content
        
        return jsonify({
            "response": bot_response,
            "character": character
        })
        
    except Exception as e:
        print(f"Error processing chat request: {e}")
        return jsonify({
            "error": "Failed to process request",
            "message": str(e)
        }), 500
if __name__ == '__main__':
    # Use PORT environment variable if available (for deployment)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)