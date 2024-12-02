# routes/buyer_routes.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import db, User, Buyer

buyer_blueprint = Blueprint('buyer', __name__)


@buyer_blueprint.route('/register', methods=['POST'])
def register_buyer():
    data = request.json
    hashed_password = generate_password_hash(data['password'])

    user = User(
        login=data['login'],
        email=data['email'],
        password=data['password'],
        phonenumber=data['phonenumber'],
        role='buyer',
        isVerified=True,
        name=data['name']
    )
    db.session.add(user)
    db.session.flush()

    buyer = Buyer(
        buyerID=user.userID,
        deliveryAddress=data['deliveryAddress'],
        paymentMethod=data['paymentMethod']
    )
    db.session.add(buyer)
    db.session.commit()
    return jsonify({"msg": "Buyer registered successfully!"}), 201

from models import Product, Farmer

@buyer_blueprint.route('/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)

    query = Product.query
    if category:
        query = query.filter_by(category=category)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    products = query.all()
    response = []
    for product in products:
        response.append({
            "productID": product.productID,
            "name": product.name,
            "category": product.category,
            "price": product.price,
            "quantity": product.quantity,
            "description": product.description,
            "images": product.images,
        })
    return jsonify(response), 200


@buyer_blueprint.route('/profile/<int:buyer_id>', methods=['GET'])
def get_buyer_profile(buyer_id):
    buyer = Buyer.query.get(buyer_id)
    user = User.query.get(buyer_id)

    if not buyer or not user:
        return jsonify({"error": "Buyer not found"}), 404

    return jsonify({
        "name": user.name,
        "email": user.email,
        "phonenumber": user.phonenumber,
        "deliveryAddress": buyer.deliveryAddress,
        "paymentMethod": buyer.paymentMethod,
    }), 200
