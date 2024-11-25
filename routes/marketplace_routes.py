from flask import Blueprint, request, jsonify, render_template
from models import db, Product, User

marketplace_blueprint = Blueprint('marketplace', __name__)

@marketplace_blueprint.route('', methods=['GET'])
def marketplace_page():
    products = Product.query.all()

    return render_template('marketplace.html', products=products)

@marketplace_blueprint.route('/add-product', methods=['POST'])
def add_product():
    data = request.json
    required_fields = ['name', 'description', 'price', 'quantity', 'farmerID']

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400
        
    farmer = User.query.filter_by(userID=data['farmerID'], role='Farmer', isVerified=True).first()
    if not farmer:
        return jsonify({"error": "Invalid or unverified farmer ID"}), 403

    new_product = Product(
        name=data['name'],
        description=data['description'],
        price=data['price'],
        quantity=data['quantity'],
        farmerID=data['farmerID']
    )
    db.session.add(new_product)
    db.session.commit()

    return jsonify({"msg": "Product published successfully!"}), 201

@marketplace_blueprint.route('/delete-product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """
    Allow farmers to delete their own products from the marketplace.
    """
    product = Product.query.get(product_id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({"msg": "Product deleted successfully!"}), 200
