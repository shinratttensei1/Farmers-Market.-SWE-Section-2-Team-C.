# routes/farmer_routes.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import db, User, Farmer, Farm

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

from models import db, Product

@farmer_blueprint.route('/add-product', methods=['POST'])
def add_product():
    data = request.json
    product = Product(
        farmerID=data['farmerID'],
        name=data['name'],
        category=data['category'],
        price=data['price'],
        quantity=data['quantity'],
        description=data['description'],
        images=data['images']
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({"msg": "Product added successfully!"}), 201

@farmer_blueprint.route('/update-product/<int:productID>', methods=['PUT'])
def update_product(productID):
    product = Product.query.get(productID)
    if not product:
        return jsonify({"msg": "Product not found"}), 404

    data = request.json
    product.name = data.get('name', product.name)
    product.category = data.get('category', product.category)
    product.price = data.get('price', product.price)
    product.quantity = data.get('quantity', product.quantity)
    product.description = data.get('description', product.description)
    product.images = data.get('images', product.images)
    db.session.commit()
    return jsonify({"msg": "Product updated successfully!"}), 200

@farmer_blueprint.route('/delete-product/<int:productID>', methods=['DELETE'])
def delete_product(productID):
    product = Product.query.get(productID)
    if not product:
        return jsonify({"msg": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"msg": "Product deleted successfully!"}), 200

@farmer_blueprint.route('/add-farm/<int:farmer_id>', methods=['POST'])
def add_farm_to_farmer(farmer_id):
    # Check if the farmer exists
    farmer = Farmer.query.get(farmer_id)
    if not farmer:
        return jsonify({"error": "Farmer not found"}), 404

    # Validate the request body
    data = request.get_json()
    if not data or not all(key in data for key in ['farmAddress', 'typesOfCrops', 'farmSize']):
        return jsonify({"error": "Invalid input, please provide all required fields"}), 400

    # Create a new farm
    new_farm = Farm(
        farmerID=farmer_id,
        farmAddress=data['farmAddress'],
        typesOfCrops=data['typesOfCrops'],
        farmSize=data['farmSize']
    )

    # Save the farm to the database
    db.session.add(new_farm)
    db.session.commit()

    return jsonify({"msg": f"Farm created successfully for Farmer ID {farmer_id}!", "farmID": new_farm.farmID}), 201