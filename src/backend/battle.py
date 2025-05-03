from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from openai import OpenAI
import json

app = Flask(__name__)
CORS(app)

# Initialize OpenAI client
client = OpenAI()

# Character personalities
PERSONAS = {
    "The Budgeting Maestro": {
        "description": "Meticulously plans every expense, tracks budgets diligently, and always knows where every cent goes.",
        "character": "Maestro Moolah",
        "style": "Formal, precise, organized. Uses musical metaphors. Talks about orchestrating finances, creating harmonious budgets, and conducting financial symphonies.",
        "traits": "Wise, meticulous, disciplined, elegant, detailed"
    },
    "The Spontaneous Spender": {
        "description": "Lives in the moment, often making impulsive purchases for instant gratification.",
        "character": "Flashy Fin",
        "style": "Energetic, playful, enthusiastic. Uses water and movement metaphors. Talks about making a splash, riding the wave of trends, and going with the flow.",
        "traits": "Impulsive, fun-loving, trend-conscious, optimistic, social"
    },
    "The Cautious Saver": {
        "description": "Prioritizes saving over spending, often setting aside funds for future security.",
        "character": "Penny the Penguin",
        "style": "Careful, thoughtful, protective. Uses winter and storage metaphors. Talks about weathering financial storms, building nest eggs, and preserving resources.",
        "traits": "Prudent, patient, conservative, safety-oriented, long-term thinker"
    },
    "The Investment Enthusiast": {
        "description": "Always looking for opportunities to grow wealth through various investments.",
        "character": "Bullish Benny",
        "style": "Confident, analytical, strategic. Uses market and growth metaphors. Talks about riding bull markets, diversifying portfolios, and cultivating financial growth.",
        "traits": "Bold, informed, ambitious, data-driven, growth-minded"
    },
    "The Deal Hunter": {
        "description": "Always on the lookout for discounts, coupons, and the best deals.",
        "character": "Bargain Buzzy",
        "style": "Alert, enthusiastic, resourceful. Uses hunting and discovery metaphors. Talks about sniffing out deals, hunting for bargains, and collecting savings.",
        "traits": "Sharp-eyed, persistent, resourceful, proud of savings, value-conscious"
    },
    "The Minimalist": {
        "description": "Prefers simplicity, avoids unnecessary expenses, and values experiences over possessions.",
        "character": "Zen Zeke",
        "style": "Calm, thoughtful, philosophical. Uses balance and nature metaphors. Talks about finding financial harmony, the richness of simplicity, and mindful spending.",
        "traits": "Peaceful, intentional, content, mindful, experience-focused"
    },
    "The Generous Giver": {
        "description": "Frequently donates to causes, helps friends in need, and values sharing wealth.",
        "character": "Charity Charlie",
        "style": "Warm, compassionate, community-minded. Uses sharing and connection metaphors. Talks about nurturing communities, planting seeds of generosity, and the ripple effects of giving.",
        "traits": "Kind-hearted, empathetic, community-focused, purposeful, generous"
    },
    "The Financial Adventurer": {
        "description": "Explores new financial tools, apps, and unconventional methods to manage money.",
        "character": "Explorer Ellie",
        "style": "Curious, innovative, adaptable. Uses exploration and discovery metaphors. Talks about charting financial territories, navigating money frontiers, and pioneering smart approaches.",
        "traits": "Tech-savvy, open-minded, innovative, flexible, forward-thinking"
    }
}

# Character to filename mapping for transactions (if needed)
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

@app.route('/api/battle-arena', methods=['POST'])
def battle_arena():
    """Legacy endpoint that gets all responses at once - kept for compatibility"""
    try:
        data = request.json
        user_question = data.get('question', '')
        selected_personas = data.get('personas', [])
        
        if not user_question or not selected_personas or len(selected_personas) < 2:
            return jsonify({
                "error": "Invalid request. Please provide a question and at least 2 personas."
            }), 400
        
        # Limit to max 4 personas
        if len(selected_personas) > 4:
            selected_personas = selected_personas[:4]
        
        # First round: Initial responses from each persona
        first_round_responses = []
        for persona_type in selected_personas:
            persona_info = PERSONAS.get(persona_type)
            if not persona_info:
                continue
            
            response = generate_persona_response(
                persona_type=persona_type,
                persona_info=persona_info,
                user_question=user_question,
                context=f"Initial response to the user's question: '{user_question}'",
                previous_responses=[]
            )
            
            first_round_responses.append({
                "persona": persona_type,
                "character": persona_info["character"],
                "text": response
            })
        
        # Second round: Responses after hearing others
        second_round_responses = []
        for persona_type in selected_personas:
            persona_info = PERSONAS.get(persona_type)
            if not persona_info:
                continue
            
            # Build context of what other personas said
            others_said = []
            for resp in first_round_responses:
                if resp["persona"] != persona_type:
                    others_said.append(f"{resp['character']} ({resp['persona']}) said: {resp['text']}")
            
            others_context = "\n\n".join(others_said)
            
            response = generate_persona_response(
                persona_type=persona_type,
                persona_info=persona_info,
                user_question=user_question,
                context=f"Follow-up response after hearing what the others said:\n{others_context}",
                previous_responses=first_round_responses
            )
            
            second_round_responses.append({
                "persona": persona_type,
                "character": persona_info["character"],
                "text": response
            })
        
        # Format conversation
        conversation = []
        for i in range(len(first_round_responses)):
            conversation.append(first_round_responses[i])
            conversation.append(second_round_responses[i])
        
        return jsonify({
            "question": user_question,
            "conversation": conversation
        })
        
    except Exception as e:
        print(f"Error processing battle request: {e}")
        return jsonify({
            "error": "Failed to process request",
            "message": str(e)
        }), 500

@app.route('/api/persona-response', methods=['POST'])
def persona_response():
    """New endpoint that supports the dynamic debate format - get one persona response at a time"""
    try:
        data = request.json
        user_question = data.get('question', '')
        personas = data.get('personas', [])
        context = data.get('context', '')
        message_type = data.get('messageType', 'initial')
        
        if not user_question or not personas or len(personas) != 1:
            return jsonify({
                "error": "Invalid request. Please provide a question and exactly 1 persona."
            }), 400
        
        persona_type = personas[0]
        persona_info = PERSONAS.get(persona_type)
        
        if not persona_info:
            return jsonify({
                "error": f"Invalid persona type: {persona_type}"
            }), 400
        
        # Generate response for this persona
        response = generate_persona_response(
            persona_type=persona_type,
            persona_info=persona_info,
            user_question=user_question,
            context=context,
            message_type=message_type
        )
        
        return jsonify({
            "persona": persona_type,
            "character": persona_info["character"],
            "response": response
        })
        
    except Exception as e:
        print(f"Error processing persona response request: {e}")
        return jsonify({
            "error": "Failed to process request",
            "message": str(e)
        }), 500

def generate_persona_response(persona_type, persona_info, user_question, context="", previous_responses=None, message_type="initial"):
    """Generate a response for a specific financial persona"""
    character = persona_info["character"]
    
    # Adjust system prompt based on message type
    base_prompt = f"""
    You are {character}, a {persona_type} character who gives financial advice.
    
    Character traits: {persona_info['traits']}
    Communication style: {persona_info['style']}
    
    You should embody this character's personality and communication style in your response.
    Keep responses concise (under 150 words) and engaging.
    
    Add occasional character actions in *asterisks* for personality, but keep them brief.
    Stay true to your financial philosophy - do not compromise your core beliefs even when responding to others.
    Be respectful of other personas but stand your ground on your financial philosophy.
    """
    
    if message_type == "initial":
        system_prompt = base_prompt + """
        This is your first statement in a debate. Present your perspective clearly and confidently.
        Focus on providing your unique financial perspective based on your character.
        """
    elif message_type == "rebuttal":
        system_prompt = base_prompt + """
        This is your rebuttal and final statement. Respond to what others have said while reinforcing your own position.
        Briefly acknowledge the perspectives of others, but emphasize why your approach is valuable.
        Be respectful but firm in your financial philosophy.
        """
    else:
        system_prompt = base_prompt
    
    # Build messages array
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Financial Question: {user_question}\n\nContext: {context}"}
    ]
    
    # Call the API
    response = client.chat.completions.create(
        model="gpt-4.1-mini",  # Use appropriate model
        messages=messages,
        temperature=0.7,  # Add some variability
        max_tokens=250
    )
    
    return response.choices[0].message.content

if __name__ == '__main__':
    # Use PORT environment variable if available (for deployment)
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)