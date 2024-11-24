from flask import Blueprint, request, jsonify, session, flash, redirect, url_for
from werkzeug.security import check_password_hash
from models import db, User

login_blueprint = Blueprint('login', __name__)

# Admin Login
@login_blueprint.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """
    Admin Login: Allows an admin to log in to the dashboard using their login (username) and password.
    """
    if request.method == 'POST':
        login = request.form.get('login')
        password = request.form.get('password')

        # Query for admin user based on login (username)
        admin_user = User.query.filter_by(login=login, role='Admin').first()

        if admin_user and check_password_hash(admin_user.password, password):
            session['user_id'] = admin_user.userID
            session['role'] = admin_user.role
            flash('Admin login successful!', 'success')
            return redirect(url_for('admin.admin_dashboard'))
        else:
            flash('Invalid login or password. Please try again.', 'danger')

    return render_template('admin_login.html')

# Buyer Login
@login_blueprint.route('/buyer/login', methods=['GET', 'POST'])
def buyer_login():
    """
    Buyer Login: Allows a buyer to log in using their login (username) and password.
    """
    if request.method == 'POST':
        login = request.form.get('login')
        password = request.form.get('password')

        # Query for buyer user based on login (username)
        buyer_user = User.query.filter_by(login=login, role='Buyer').first()

        if buyer_user and check_password_hash(buyer_user.password, password):
            session['user_id'] = buyer_user.userID
            session['role'] = buyer_user.role
            flash('Buyer login successful!', 'success')
            return redirect(url_for('buyer.buyer_dashboard'))  # Redirect to buyer's dashboard
        else:
            flash('Invalid login or password. Please try again.', 'danger')

    return render_template('buyer_login.html')

# Farmer Login
@login_blueprint.route('/farmer/login', methods=['GET', 'POST'])
def farmer_login():
    """
    Farmer Login: Allows a farmer to log in using their login (username) and password.
    """
    if request.method == 'POST':
        login = request.form.get('login')
        password = request.form.get('password')

        # Query for farmer user based on login (username)
        farmer_user = User.query.filter_by(login=login, role='Farmer').first()

        if farmer_user and check_password_hash(farmer_user.password, password):
            session['user_id'] = farmer_user.userID
            session['role'] = farmer_user.role
            flash('Farmer login successful!', 'success')
            return redirect(url_for('farmer.farmer_dashboard'))  # Redirect to farmer's dashboard
        else:
            flash('Invalid login or password. Please try again.', 'danger')

    return render_template('farmer_login.html')

# Logout for All Roles
@login_blueprint.route('/logout', methods=['GET'])
def logout():
    """
    Logout: Clears the session and redirects to the login page based on the user's role.
    """
    role = session.get('role', 'Unknown')
    session.clear()
    flash(f'{role} logged out successfully.', 'info')

    if role == 'Admin':
        return redirect(url_for('login.admin_login'))
    elif role == 'Buyer':
        return redirect(url_for('login.buyer_login'))
    elif role == 'Farmer':
        return redirect(url_for('login.farmer_login'))
    else:
        return redirect(url_for('login.admin_login'))  # Default to admin login if role is unknown
