from flask import Blueprint, request, jsonify, redirect, url_for
from models import db, Farmer, User, Buyer, Farm
from models import Product

admin_blueprint = Blueprint('admin', __name__)

@admin_blueprint.route('/test', methods=['GET'])
def test_admin():
    return jsonify({"msg": "Admin route is working!"})


@admin_blueprint.route('/pending-farmers', methods=['GET'])
def get_pending_farmers():
    # Query farmers who are not verified
    pending_farmers = db.session.query(User, Farmer).join(Farmer).filter(User.isVerified == False).all()
    response = []
    for user, farmer in pending_farmers:
        response.append({
            "farmerID": farmer.farmerID,
            "name": user.name,
            "email": user.email,
            "phonenumber": user.phonenumber,
            "govID": farmer.govermentIssuedID,
            "resources": farmer.resources,
            "rating": farmer.rating,
        })
    return jsonify(response), 200

@admin_blueprint.route('/approve-user/<int:user_id>', methods=['PUT'])
def approve_user(user_id):
    """
    Approve a farmer user by setting 'isVerified' to True.
    Ensures that 'isVerified' is updated even if other errors occur.
    """
    try:
        # Fetch the user
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Ensure the user is a farmer
        if user.role != 'farmer':
            return jsonify({"error": "Only farmers can be approved"}), 400

        # Set isVerified to True
        user.isVerified = True
        db.session.commit()

        return jsonify({"msg": f"User '{user.name}' has been approved successfully!"}), 200

    except Exception as e:
        db.session.rollback()  # Rollback any ongoing transaction
        try:
            # Ensure isVerified is set to True as a fallback
            user = User.query.get(user_id)  # Re-fetch the user
            if user and user.role == 'farmer':  # Double-check user and role
                user.isVerified = True
                db.session.commit()
                return jsonify({"warning": f"An error occurred, but '{user.name}' was still approved: {str(e)}"}), 200
        except Exception as rollback_error:
            return jsonify({
                "error": f"Critical error while approving the user: {str(e)}",
                "rollback_error": str(rollback_error)
            }), 500


@admin_blueprint.route('/reject-user/<int:userID>', methods=['GET', 'DELETE'])
def reject_user(userID):
    user = User.query.get(userID)
    if not user or user.role != 'farmer':
        return jsonify({"msg": "User not found or invalid role"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": f"{user.name} has been rejected and removed!"}), 200


from flask_jwt_extended import create_access_token

@admin_blueprint.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"msg": "Invalid credentials"}), 401

    # Create JWT token
    access_token = create_access_token(identity={"userID": user.userID, "role": user.role})
    return jsonify({"access_token": access_token}), 200

# routes/admin_routes.py
from flask import Blueprint, jsonify, render_template

admin_blueprint = Blueprint('admin', __name__)

@admin_blueprint.route('/', methods=['GET'])
def admin_starter_page():
    return render_template('admin_starter.html')


@admin_blueprint.route('/dashboard', methods=['GET'])
def admin_dashboard():
    # Check if admin is logged in
    if 'admin_user_id' not in session or session.get('admin_user_role') != 'Admin':
        flash('Unauthorized access. Please log in.', 'danger')
        return redirect(url_for('admin.admin_login'))

    # Fetch the admin details
    admin_user = User.query.get(session['admin_user_id'])

    # Query pending farmers
    pending_farmers = db.session.query(User, Farmer).filter(
        User.userID == Farmer.farmerID,
        User.isVerified == False
    ).all()

    # Query registered farmers
    registered_farmers = db.session.query(User, Farmer).filter(
        User.userID == Farmer.farmerID,
        User.isVerified == True
    ).all()

    # Query registered buyers
    all_buyers = db.session.query(User, Buyer).join(Buyer, User.userID == Buyer.buyerID).all()

    # Render the dashboard
    return render_template(
        'admin_dashboard.html',
        admin_name=admin_user.name,
        pending_farmers=pending_farmers,
        registered_farmers=registered_farmers,
        all_buyers=all_buyers
    )




@admin_blueprint.route('/approve-user/<int:user_id>', methods=['PUT'])
def approve_user(user_id):
    user = User.query.get(user_id)
    if not user or user.role != 'farmer':
        return jsonify({"error": "User not found or invalid role"}), 404

    user.isVerified = True
    db.session.commit()
    return jsonify({"msg": f"User '{user.name}' approved successfully!"}), 200



@admin_blueprint.route('/delete-user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        # Fetch the user
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check user role and delete associated data
        if user.role == 'farmer':
            # Delete all products associated with the farmer
            Product.query.filter_by(farmerID=user_id).delete()

            # Delete all farms associated with the farmer
            Farm.query.filter_by(farmerID=user_id).delete()

            # Delete the farmer entry
            Farmer.query.filter_by(farmerID=user_id).delete()

        elif user.role == 'buyer':
            # Delete the buyer entry if the user is a buyer
            Buyer.query.filter_by(buyerID=user_id).delete()

        # Finally, delete the user
        db.session.delete(user)
        db.session.commit()

        return jsonify({"msg": f"User '{user.name}' and their associated data have been deleted successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred while deleting the user: {str(e)}"}), 500



@admin_blueprint.route('/farms/<int:farmer_id>', methods=['GET'])
def get_farms(farmer_id):
    try:
        # Fetch farmer details
        farmer = Farmer.query.get(farmer_id)
        user = User.query.get(farmer_id)  # Assuming Farmer has the same userID as in the User table
        if not farmer or not user:
            return "Farmer not found", 404

        # Fetch farms for the farmer
        farms = Farm.query.filter_by(farmerID=farmer_id).all()

        # Render the details in a new template
        return render_template('farmer_details.html', farmer=farmer, user=user, farms=farms)
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@admin_blueprint.route('/reject-user/<int:user_id>', methods=['DELETE'])
def reject_user(user_id):
    user = User.query.get(user_id)
    if not user or user.role != 'farmer':
        return jsonify({"error": "User not found or invalid role"}), 404

    # Delete related farmer entry if exists
    farmer = Farmer.query.filter_by(farmerID=user.userID).first()
    if farmer:
        db.session.delete(farmer)

    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": f"User '{user.name}' rejected and removed!"}), 200


@admin_blueprint.route('/edit-user/<int:user_id>', methods=['GET', 'POST'])
def edit_user(user_id):
    # Fetch the user
    user = User.query.get(user_id)
    if not user:
        return "User not found", 404

    # Fetch farmer or buyer details if applicable
    farmer = Farmer.query.filter_by(farmerID=user_id).first()
    buyer = Buyer.query.filter_by(buyerID=user_id).first()

    if request.method == 'GET':
        # Render the edit user page with role-specific details
        return render_template('edit_user.html', user=user, farmer=farmer, buyer=buyer)

    if request.method == 'POST':
        try:
            # Update general user details
            user.name = request.form['name']
            user.email = request.form['email']
            user.phonenumber = request.form['phonenumber']

            # Update farmer-specific details
            if farmer:
                farmer.profilePicture = request.form.get('profilePicture', farmer.profilePicture)
                farmer.resources = request.form.get('resources', farmer.resources)
                farmer.rating = request.form.get('rating', farmer.rating)

            # Update buyer-specific details
            if buyer:
                buyer.deliveryAddress = request.form.get('deliveryAddress', buyer.deliveryAddress)
                buyer.paymentMethod = request.form.get('paymentMethod', buyer.paymentMethod)

            db.session.commit()
            return redirect(url_for('admin.admin_dashboard'))

        except Exception as e:
            print(f"Error while updating user: {e}")
            db.session.rollback()
            return "An error occurred while updating user details", 500


from flask import session, flash  # Ensure these imports are present
import pyotp
two_factor_secrets = {}
@admin_blueprint.route('/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        admin_user = User.query.filter_by(email=email, role='Admin').first()
        # Check if email and password match (using direct comparison)
        if admin_user and admin_user.password == password:
            # Generate a 2FA secret and store it in session
            totp = pyotp.TOTP(pyotp.random_base32())
            session['two_factor_secret'] = totp.secret  # Store the secret in session
            print(session['two_factor_secret'])
            # Send OTP to user (you would usually send this via email or SMS)
            otp = totp.now()
            print(f"OTP for {email}: {otp}")  # In real-world use, you would send this to the user

            # Render the OTP form
            return render_template('admin_login.html', otp_form=True)
        else:
            flash('Invalid email or password', 'danger')

    return render_template('admin_login.html',otp_form=False)


@admin_blueprint.route('/admin/verify_otp', methods=['POST'])
def verify_otp():
    if 'two_factor_secret' not in session:
        return redirect(url_for('admin_login'))
    print('just checking otp')
    otp = request.form['otp']
    totp = pyotp.TOTP(session['two_factor_secret'])

    # Validate OTP
    if totp.verify(otp):
        print('Login successful!')
        flash('Login successful!', 'success')
        return redirect(url_for('admin.admin_dashboard'))  # Redirect to a dashboard or admin page
    else:
        flash('Invalid OTP. Please try again.', 'danger')
        return redirect(url_for('admin.admin_login'))


@admin_blueprint.route('/logout', methods=['GET'])
def admin_logout():
    """
    Admin Logout: Clears the session and redirects to login.
    """
    session.clear()  # Clear session data
    flash('Logged out successfully.', 'info')
    return redirect(url_for('admin.admin_login'))

@admin_blueprint.route('/disable-user/<int:user_id>', methods=['PUT'])
def disable_user(user_id):
    # Fetch the user by ID
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Set isVerified to 0 (disabled)
    user.isVerified = False
    db.session.commit()

    return jsonify({"msg": f"User '{user.name}' has been disabled."}), 200

@admin_blueprint.route('/enable-user/<int:user_id>', methods=['PUT'])
def enable_user(user_id):
    # Fetch the user by ID
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Set isVerified to 1 (enabled)
    user.isVerified = True
    db.session.commit()

    return jsonify({"msg": f"User '{user.name}' has been enabled."}), 200



@admin_blueprint.route('/register', methods=['GET', 'POST'])
def register_admin():
    if request.method == 'POST':
        # Collect form data
        login = request.form['login']
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        phonenumber = request.form['phonenumber']

        # Check if the email or login is already registered
        if User.query.filter((User.email == email) | (User.login == login)).first():
            flash('Email or login is already registered. Please log in.', 'danger')
            return redirect(url_for('admin.admin_login'))

        # Create a new admin user
        new_admin = User(
            login=login,
            email=email,
            password=password,
            phonenumber=phonenumber,
            role='Admin',
            isVerified=True,
            name=name
        )
        db.session.add(new_admin)
        db.session.commit()

        # Redirect to the login page
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('admin.admin_login'))

    return render_template('admin_register.html')



@admin_blueprint.route('/register', methods=['GET', 'POST'])
def register_admin_page():
    if request.method == 'POST':
        # Collect form data
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        phonenumber = request.form['phonenumber']

        # Check if the email is already registered
        if User.query.filter_by(email=email).first():
            flash('Email is already registered. Please log in.', 'danger')
            return redirect(url_for('admin.admin_login'))

        # Create a new admin user
        new_admin = User(
            login=email,  # Using email as the login
            email=email,
            password=password,
            phonenumber=phonenumber,
            role='Admin',
            isVerified=True,
            name=name
        )
        db.session.add(new_admin)
        db.session.commit()

        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('admin.admin_login'))

    return render_template('admin_register.html')
