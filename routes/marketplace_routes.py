import os
import json
from flask import Blueprint, request, jsonify, render_template
from werkzeug.utils import secure_filename
from models import db, Product, User

# Single blueprint for both web and API functionality
marketplace_web = Blueprint('marketplace_web', __name__)

@marketplace_web.route('/products', methods=['GET'])
def marketplace_page():
    products = Product.query.all()
    return render_template('marketplace.html', products=products)

@marketplace_web.route('/', methods=['GET'])
def marketplace_fetch():
    """
    Serve marketplace products as a webpage or JSON API based on request type.
    """
    products = Product.query.all()

    # Check if the request asks for JSON response
    if request.accept_mimetypes['application/json'] or request.args.get('format') == 'json':
        return jsonify([
            {
                "name": product.name,
                "category": product.category,
                "price": product.price,
                "quantity": product.quantity,
                "description": product.description,
                "images": json.loads(product.images) if isinstance(product.images, str) else product.images,
                "location": getattr(product, "farm_location", "Unknown")
            }
            for product in products
        ]), 200

    # Default to rendering the webpage
    return render_template('marketplace.html', products=products)

@marketplace_web.route('/add-product', methods=['POST'])
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

@marketplace_web.route('/delete-product/<int:product_id>', methods=['DELETE'])
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
