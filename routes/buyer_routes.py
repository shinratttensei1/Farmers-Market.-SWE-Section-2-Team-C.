# routes/buyer_routes.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import db, User, Buyer

buyer_blueprint = Blueprint('buyer', __name__)


@buyer_blueprint.route('/register', methods=['POST'])
def register_buyer():
    data = request.json
    hashed_password = generate_password_hash(data['password'])

    # Create user entry
    user = User(
        login=data['login'],
        email=data['email'],
        password=hashed_password,
        phonenumber=data['phonenumber'],
        role='buyer',
        isVerified=True,  # Buyers don't need admin approval
        name=data['name']
    )
    db.session.add(user)
    db.session.flush()  # Get user ID before committing

    # Create buyer entry
    buyer = Buyer(
        buyerID=user.userID,
        deliveryAddress=data['deliveryAddress'],
        paymentMethod=data['paymentMethod']
    )
    db.session.add(buyer)
    db.session.commit()
    return jsonify({"msg": "Buyer registered successfully!"}), 201
