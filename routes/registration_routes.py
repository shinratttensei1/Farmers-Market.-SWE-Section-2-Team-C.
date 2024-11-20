from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import db, User, Farmer, Buyer

registration_blueprint = Blueprint('registration', __name__)

@registration_blueprint.route('/register', methods=['POST'])
def register_user():
    data = request.json

    required_fields = ['login', 'email', 'password', 'phonenumber', 'role', 'name']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    hashed_password = generate_password_hash(data['password'])

    user = User(
        login=data['login'],
        email=data['email'],
        password=hashed_password,
        phonenumber=data['phonenumber'],
        role=data['role'],
        isVerified=False,
        name=data['name']
    )
    db.session.add(user)
    db.session.flush()

    if data['role'] == 'farmer':
        farmer_fields = ['govermentIssuedID', 'profilePicture', 'resources']
        for field in farmer_fields:
            if field not in data:
                return jsonify({"error": f"Missing field for farmer: {field}"}), 400

        farmer = Farmer(
            farmerID=user.userID,
            govermentIssuedID=data['govermentIssuedID'],
            profilePicture=data['profilePicture'],
            resources=data['resources'],
            rating=0.0
        )
        db.session.add(farmer)

    elif data['role'] == 'buyer':
        buyer_fields = ['deliveryAddress', 'paymentMethod']
        for field in buyer_fields:
            if field not in data:
                return jsonify({"error": f"Missing field for buyer: {field}"}), 400

        buyer = Buyer(
            buyerID=user.userID,
            deliveryAddress=data['deliveryAddress'],
            paymentMethod=data['paymentMethod']
        )
        db.session.add(buyer)

    else:
        return jsonify({"error": "Invalid role. Must be 'farmer' or 'buyer'"}), 400

    db.session.commit()
    return jsonify({"msg": f"{data['role'].capitalize()} registered successfully!"}), 201
