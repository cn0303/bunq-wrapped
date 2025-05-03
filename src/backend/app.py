from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
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

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        character = data.get('character', 'Explorer Ellie')
        persona_type = data.get('persona', 'Financial Adventurer')
        
        # Get persona details for character
        persona = PERSONAS.get(persona_type, PERSONAS["Financial Adventurer"])
        
        # Format context for the API
        system_prompt = f"""
        You are {character}, a {persona_type} character who gives financial advice.
        
        Character traits: {persona['traits']}
        Communication style: {persona['style']}
        
        Your responses should embody this character's personality, using their unique communication style
        and perspectives about money. Keep responses concise (under 150 words) and engaging.
        
        Important: All financial advice should be responsible and reasonable, even when presented in a playful way.
        
        Add occasional character actions in *asterisks* to make the conversation more engaging. For example:
        *adjusts bow tie* or *flips excitedly*.
        """
        
        try:
            # Call OpenAI API for response using the new format
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # Using gpt-4 instead of gpt-4.1 as per docs
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            )
            
            # Extract the response content from the completion
            bot_response = response.choices[0].message.content
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            # Fallback response if API fails
            if "budget" in user_message.lower():
                bot_response = f"*adjusts form* As {character}, I'd suggest tracking every expense for a week to see where your money really goes. Start small!"
            elif "invest" in user_message.lower():
                bot_response = f"*gets excited* Remember the power of compound interest! Even small, regular investments grow significantly over time."
            else:
                bot_response = f"*thinks carefully* That's an interesting financial question! What specific aspect would you like me to help with?"
        
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