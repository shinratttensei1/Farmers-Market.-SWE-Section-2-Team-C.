from flask import Blueprint, request, jsonify, session, flash, redirect, url_for
from werkzeug.security import check_password_hash
from models import db, User

login_blueprint = Blueprint('login', __name__)
 
@login_blueprint.route('/app/login', methods=['POST'])
def login_app():
    try:
        # Parse JSON payload from the request
        data = request.json
        
        # Validate input
        if 'login' not in data or 'password' not in data:
            return jsonify({"error": "Missing 'login' or 'password'"}), 400
        
        login = data['login']
        password = data['password']

        user = User.query.filter_by(login=login).first()

        if login and check_password_hash(user.password, password):
            session['user_id'] = user.userID
            session['role'] = user.role
            flash('User login successful!', 'success')
            return redirect(url_for('admin.admin_dashboard'))
        else:
            return jsonify({"error": "Invalid login or password"}), 401

    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"error": "Something went wrong"}), 500