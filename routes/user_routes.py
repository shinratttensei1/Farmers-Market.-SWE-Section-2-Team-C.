from flask import Blueprint, jsonify
from models import User

# Define the blueprint
user_blueprint = Blueprint('user', __name__)

@user_blueprint.route('/<int:user_id>', methods=['GET'])
def get_user_role(user_id):
    try:
        # Query the User table to find the user
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Return the user's role
        return jsonify({"userID": user.userID, "role": user.role}), 200

    except Exception as e:
        print(f"Error fetching user role: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
