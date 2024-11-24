from flask import Blueprint, request, jsonify, session, flash, redirect, url_for
from werkzeug.security import check_password_hash
from models import db, User

login_blueprint = Blueprint('login', __name__)
 
@login_blueprint.route('/app/login', methods=['POST'])
def login_app():
    try:
        # print("Headers:", request.headers)  # Debugging headers
        # print("Content-Type:", request.content_type)  # Debugging content type

        data = request.json

        if 'login' not in data or 'password' not in data:
            return jsonify({"error": "Missing 'login' or 'password'"}), 400
        
        login = data['login']
        password = data['password']

        user = User.query.filter_by(login=login).first()

        # if user and check_password_hash(user.password, password):
        if user and user.password == password:
            session['user_id'] = user.userID
            session['role'] = user.role
            return jsonify({
                "msg": "Login successful!",
                "user": {
                    "userID": user.userID,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role
                }
            }), 200
        else:
            return jsonify({"error": "Invalid login or password"}), 401
    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"error": "Something went wrong"}), 500