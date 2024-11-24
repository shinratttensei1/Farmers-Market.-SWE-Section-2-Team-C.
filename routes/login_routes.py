from flask import Blueprint, request, jsonify, session, redirect, url_for, flash
from werkzeug.security import check_password_hash
from models import db, User

login_blueprint = Blueprint('login', __name__)

@login_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    """
    Handle user login for Admins, Farmers, and Buyers.
    """
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        # Find the user by email
        user = User.query.filter_by(email=email).first()

        # Check if the user exists and if the password is correct
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.userID
            session['user_role'] = user.role
            session['user_name'] = user.name

            if user.role == 'Admin':
                flash('Login successful!', 'success')
                return redirect(url_for('admin.admin_dashboard'))
            elif user.role == 'Farmer':
                flash('Welcome Farmer!', 'success')
                return redirect(url_for('farmer.farmer_dashboard'))
            elif user.role == 'Buyer':
                flash('Welcome Buyer!', 'success')
                return redirect(url_for('buyer.buyer_dashboard'))
            else:
                flash('Invalid role.', 'danger')
                return redirect(url_for('login.login'))

        flash('Invalid email or password.', 'danger')

    return redirect(url_for('login.login_page'))


@login_blueprint.route('/logout', methods=['GET'])
def logout():
    """
    Log out the current user and clear the session.
    """
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login.login_page'))


@login_blueprint.route('/login-page', methods=['GET'])
def login_page():
    """
    Render the login page for users.
    """
    return redirect(url_for('static', filename='admin_login.html'))