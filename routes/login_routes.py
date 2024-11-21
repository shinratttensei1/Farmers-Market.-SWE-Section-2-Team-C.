from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from models import db, User

login_blueprint = Blueprint('login', __name__)

@login_blueprint.route('/login', methods=['POST'])
def login_user():
    data = request.json

    if 'login' not in data or 'password' not in data:
        return jsonify({"error": "Missing 'login' or 'password'"}), 400

    user = User.query.filter_by(login=data['login']).first()

    if not user:
        return jsonify({"error": "Invalid login or password"}), 401

    if not check_password_hash(user.password, data['password']):
        return jsonify({"error": "Invalid login or password"}), 401

    return jsonify({
        "msg": "Login successful!",
        "user": {
            "userID": user.userID,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200
