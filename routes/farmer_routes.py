# routes/farmer_routes.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import db, User, Farmer

farmer_blueprint = Blueprint('farmer', __name__)


@farmer_blueprint.route('/register', methods=['POST'])
def register_farmer():
    data = request.json
    hashed_password = generate_password_hash(data['password'])

    # Create user entry
    user = User(
        login=data['login'],
        email=data['email'],
        password=hashed_password,
        phonenumber=data['phonenumber'],
        role='farmer',
        isVerified=False,
        name=data['name']
    )
    db.session.add(user)
    db.session.flush()  # Get user ID before committing

    # Create farmer entry
    farmer = Farmer(
        farmerID=user.userID,
        govermentIssuedID=data['govermentIssuedID'],
        profilePicture=data['profilePicture'],
        resources=data['resources'],
        rating=0.0  # Default rating
    )
    db.session.add(farmer)
    db.session.commit()
    return jsonify({"msg": "Farmer registered successfully, pending approval."}), 201
