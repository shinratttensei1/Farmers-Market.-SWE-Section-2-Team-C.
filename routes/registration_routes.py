from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import db, User, Farmer, Buyer

registration_blueprint = Blueprint('registration', __name__)

@registration_blueprint.route('/register', methods=['POST'])
def register_user():
    data = request.json

    # Validate input
    required_fields = ['login', 'email', 'password', 'phonenumber', 'role', 'name']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    # Hash the password
    hashed_password = generate_password_hash(data['password'])

    # Create the user
    user = User(
        login=data['login'],
        email=data['email'],
        password=hashed_password,
        phonenumber=data['phonenumber'],
        role=data['role'],
        isVerified=False,  # Default to unverified
        name=data['name']
    )
    db.session.add(user)
    db.session.flush()  # Save to get the userID

    # Additional data based on role
    if data['role'] == 'farmer':
        # Check for farmer-specific fields
        farmer_fields = ['govermentIssuedID', 'profilePicture', 'resources']
        for field in farmer_fields:
            if field not in data:
                return jsonify({"error": f"Missing field for farmer: {field}"}), 400

        # Create Farmer entry
        farmer = Farmer(
            farmerID=user.userID,
            govermentIssuedID=data['govermentIssuedID'],
            profilePicture=data['profilePicture'],
            resources=data['resources'],
            rating=0.0
        )
        db.session.add(farmer)

    elif data['role'] == 'buyer':
        # Check for buyer-specific fields
        buyer_fields = ['deliveryAddress', 'paymentMethod']
        for field in buyer_fields:
            if field not in data:
                return jsonify({"error": f"Missing field for buyer: {field}"}), 400

        # Create Buyer entry
        buyer = Buyer(
            buyerID=user.userID,
            deliveryAddress=data['deliveryAddress'],
            paymentMethod=data['paymentMethod']
        )
        db.session.add(buyer)

    else:
        return jsonify({"error": "Invalid role. Must be 'farmer' or 'buyer'"}), 400

    # Commit the changes
    db.session.commit()
    return jsonify({"msg": f"{data['role'].capitalize()} registered successfully!"}), 201
