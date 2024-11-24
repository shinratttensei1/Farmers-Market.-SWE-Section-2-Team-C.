from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import db, User, Farmer, Buyer

registration_blueprint = Blueprint('registration', __name__)

@registration_blueprint.route('/register', methods=['POST'])
def register_user():
    data = request.json

    # Check for required fields common to all roles
    required_fields = ['login', 'email', 'password', 'phonenumber', 'role', 'name']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    # Create a new user object
    user = User(
        login=data['login'],
        email=data['email'],
        password=data['password'],
        phonenumber=data['phonenumber'],
        role=data['role'],
        isVerified=True if data['role'] == 'Admin' else False,  # Admins are verified by default
        name=data['name']
    )
    db.session.add(user)
    db.session.flush()  # Flush to get user.userID

    if data['role'].lower() == 'farmer':
        # Validate fields for farmers
        farmer_fields = ['govermentIssuedID', 'profilePicture', 'resources']
        for field in farmer_fields:
            if field not in data:
                return jsonify({"error": f"Missing field for farmer: {field}"}), 400

        # Create a new farmer object
        farmer = Farmer(
            farmerID=user.userID,
            govermentIssuedID=data['govermentIssuedID'],
            profilePicture=data['profilePicture'],
            resources=data['resources'],
            rating=0.0
        )
        db.session.add(farmer)

    elif data['role'].lower() == 'buyer':
        # Validate fields for buyers
        buyer_fields = ['deliveryAddress', 'paymentMethod']
        for field in buyer_fields:
            if field not in data:
                return jsonify({"error": f"Missing field for buyer: {field}"}), 400

        # Create a new buyer object
        buyer = Buyer(
            buyerID=user.userID,
            deliveryAddress=data['deliveryAddress'],
            paymentMethod=data['paymentMethod']
        )
        db.session.add(buyer)

    elif data['role'].lower() == 'admin':
        # Admin-specific logic (optional: add more admin-specific fields if needed)
        # No additional tables required for admins in this case
        pass  # Admin is already added to the User table

    else:
        return jsonify({"error": "Invalid role. Must be 'farmer', 'buyer', or 'admin'"}), 400

    # Commit all changes to the database
    db.session.commit()

    return jsonify({"msg": f"{data['role'].capitalize()} registered successfully!"}), 201
