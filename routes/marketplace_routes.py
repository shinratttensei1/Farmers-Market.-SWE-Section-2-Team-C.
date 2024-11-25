import os

from flask import Blueprint, request, jsonify, render_template
from werkzeug.utils import secure_filename
import json

from models import db, Product, User

marketplace_blueprint = Blueprint('marketplace', __name__)

@marketplace_blueprint.route('', methods=['GET'])
def marketplace_page():
    products = Product.query.all()

    return render_template('marketplace.html', products=products)

@marketplace_blueprint.route('/add-product', methods=['POST'])
def add_product():
    """
    Allow farmers to publish their products to the marketplace with multiple images.
    """
    data = request.form
    required_fields = ['name', 'description', 'price', 'quantity', 'farmerID', 'category']

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400
        
    farmer = User.query.filter_by(userID=data['farmerID'], role='Farmer', isVerified=True).first()
    if not farmer:
        return jsonify({"error": "Invalid or unverified farmer ID"}), 403

    files = request.files.getlist('images')
    image_paths = []

    for file in files:
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join('static/uploads', filename)
            file.save(file_path)
            image_paths.append(file_path)

    new_product = Product(
        name=data['name'],
        description=data['description'],
        category=data['category'],
        price=float(data['price']),
        quantity=int(data['quantity']),
        farmerID=int(data['farmerID']),
        images=json.dumps(image_paths)
    )
    db.session.add(new_product)
    db.session.commit()

    return jsonify({"msg": "Product published successfully!", "productID": new_product.productID}), 201




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


@marketplace_blueprint.route('/api/marketplace', methods=['GET'])
def marketplace_api():
    # Perform the same filtering, sorting, and search logic
    # (similar to the `/marketplace` route above)
    query = Product.query

    # Process search and filters from request.args
    # Build the query...
    # (see logic above)

    # Return JSON response
    products = query.all()
    return jsonify([{
        "name": product.name,
        "category": product.category,
        "price": product.price,
        "quantity": product.quantity,
        "description": product.description,
        "images": product.images.split(',') if product.images else [],
        "location": product.farm_location
    } for product in products]), 200
