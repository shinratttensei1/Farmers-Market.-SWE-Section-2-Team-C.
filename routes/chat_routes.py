from flask import Blueprint, request, jsonify
from models import db, Chat, Message, Farmer, Buyer
from datetime import datetime

# Define the blueprint
chat_blueprint = Blueprint('chat', __name__)

# 1. Create a new chat between a buyer and a farmer
@chat_blueprint.route('/create', methods=['POST'])
def create_chat():
    try:
        data = request.json
        farmerID = data.get("farmerID")
        buyerID = data.get("buyerID")

        if not all([farmerID, buyerID]):
            return jsonify({"error": "Missing required fields"}), 400

        # Validate foreign key references
        farmer = Farmer.query.get(farmerID)
        buyer = Buyer.query.get(buyerID)

        if not farmer or not buyer:
            return jsonify({"error": "Invalid farmer or buyer ID"}), 400

        # Check if chat already exists
        existing_chat = Chat.query.filter_by(farmerID=farmerID, buyerID=buyerID).first()
        if existing_chat:
            return jsonify({"chatID": existing_chat.chatID, "message": "Chat already exists"}), 200

        # Create a new chat
        new_chat = Chat(
            farmerID=farmerID,
            buyerID=buyerID,
            start_time=int(datetime.utcnow().timestamp()),
            last_updated=int(datetime.utcnow().timestamp())
        )
        db.session.add(new_chat)
        db.session.commit()

        return jsonify({"chatID": new_chat.chatID, "message": "Chat created successfully"}), 201

    except Exception as e:
        print(f"Error creating chat: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
# 2. Fetch all chats for a specific user
@chat_blueprint.route('/<string:user_type>/<int:user_id>', methods=['GET'])
def fetch_chats(user_type, user_id):
    try:
        if user_type not in ['farmer', 'buyer']:
            return jsonify({"error": "Invalid user type"}), 400

        # Fetch chats where the user is either a farmer or a buyer
        if user_type == 'farmer':
            chats = Chat.query.filter_by(farmerID=user_id).all()
        else:
            chats = Chat.query.filter_by(buyerID=user_id).all()

        # Format the response
        chat_list = [{
            "chatID": chat.chatID,
            "farmerID": chat.farmerID,
            "buyerID": chat.buyerID,
            "start_time": chat.start_time,
            "last_updated": chat.last_updated
        } for chat in chats]

        return jsonify({"chats": chat_list}), 200

    except Exception as e:
        print(f"Error fetching chats: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# 3. Send a message in a specific chat
@chat_blueprint.route('/message', methods=['POST'])
def send_message():
    try:
        data = request.json
        chatID = data.get('chatID')
        sender = data.get('sender')  # "farmer" or "buyer"
        messageText = data.get('messageText')

        if not all([chatID, sender, messageText]):
            return jsonify({"error": "Missing required fields"}), 400

        if sender not in ['farmer', 'buyer']:
            return jsonify({"error": "Invalid sender"}), 400

        # Create new message
        new_message = Message(
            chatID=chatID,
            sender=sender,
            messageText=messageText,
            messageDateTime=datetime.utcnow()
        )
        db.session.add(new_message)

        # Update chat's last_updated timestamp
        chat = Chat.query.get(chatID)
        if chat:
            chat.last_updated = int(datetime.utcnow().timestamp())
        db.session.commit()

        return jsonify({"message": "Message sent successfully"}), 201

    except Exception as e:
        print(f"Error sending message: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# 4. Fetch messages for a specific chat
@chat_blueprint.route('/messages/<int:chatID>', methods=['GET'])
def fetch_messages(chatID):
    try:
        messages = Message.query.filter_by(chatID=chatID).order_by(Message.messageDateTime).all()

        # Format the response
        message_list = [{
            "messageID": msg.messageID,
            "sender": msg.sender,
            "messageText": msg.messageText,
            "messageDateTime": msg.messageDateTime.strftime('%Y-%m-%d %H:%M:%S')
        } for msg in messages]

        return jsonify({"messages": message_list}), 200

    except Exception as e:
        print(f"Error fetching messages: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
