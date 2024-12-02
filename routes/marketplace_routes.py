import datetime
import os
import json
from flask import Blueprint, request, jsonify, render_template
from werkzeug.utils import secure_filename
from models import db, Product, User, Farm, Cart, CartProduct, Order

# Single blueprint for both web and API functionality
marketplace_web = Blueprint('marketplace_web', __name__)

@marketplace_web.route('/products', methods=['GET'])
def marketplace_page():
    products = Product.query.all()
    return render_template('marketplace.html', products=products)

@marketplace_web.route('/', methods=['GET'])
def marketplace_fetch():
    try:
        # Fetch products with required fields, including productID
        products = Product.query.join(Farm, Product.farmID == Farm.farmID).add_columns(
            Product.productID,  # Include productID
            Product.name,
            Product.category,
            Product.quantity,
            Product.price,
            Product.description,
            Product.images,
            Farm.farmAddress.label('farmAddress')
        ).all()

        if request.accept_mimetypes['application/json'] or request.args.get('format') == 'json':
            return jsonify([{
                "productID": product.productID,  # Include productID in the response
                "name": product.name,
                "category": product.category,
                "price": product.price,
                "quantity": product.quantity,
                "description": product.description,
                "images": json.loads(product.images) if isinstance(product.images, str) else product.images,
                "farmAddress": product.farmAddress
            } for product in products]), 200

        return render_template('marketplace.html', products=products)

    except Exception as e:
        print(f"Error in marketplace_fetch: {e}")
        return jsonify({"error": str(e)}), 500

@marketplace_web.route('/add-product', methods=['POST'])
def add_product():
    data = request.form
    required_fields = ['name', 'description', 'price', 'quantity', 'farmerID', 'category', 'farmID']

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
        images=json.dumps(image_paths),
        farmID=data['farmID']
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

@marketplace_web.route('/cart/add', methods=['POST'])
def add_to_cart():
    """
    Adds a product to the cart for the specified buyer.
    """
    data = request.json
    required_fields = ['buyerID', 'productID']

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    # Validate Buyer
    buyer = User.query.filter_by(userID=data['buyerID'], role='Buyer').first()
    if not buyer:
        return jsonify({"error": "Invalid buyer ID"}), 403

    # Validate Product
    product = Product.query.get(data['productID'])
    if not product:
        return jsonify({"error": "Invalid product ID"}), 404

    # Get or Create Cart
    cart = Cart.query.filter_by(buyerID=buyer.userID).first()
    if not cart:
        cart = Cart(buyerID=buyer.userID)
        db.session.add(cart)
        db.session.commit()

    # Add Product to Cart
    cart_product = CartProduct(cartID=cart.cartID, productID=product.productID)
    db.session.add(cart_product)
    db.session.commit()

    return jsonify({"msg": "Product added to cart successfully!"}), 201

@marketplace_web.route('/cart/remove', methods=['DELETE'])
def remove_from_cart():
    """
    Removes a product from the cart for the specified buyer.
    """
    data = request.json
    required_fields = ['buyerID', 'productID']

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    # Validate Buyer
    buyer = User.query.filter_by(userID=data['buyerID'], role='Buyer').first()
    if not buyer:
        return jsonify({"error": "Invalid buyer ID"}), 403

    # Get Cart
    cart = Cart.query.filter_by(buyerID=buyer.userID).first()
    if not cart:
        return jsonify({"error": "Cart not found"}), 404

    # Remove Product from Cart
    cart_product = CartProduct.query.filter_by(cartID=cart.cartID, productID=data['productID']).first()
    if not cart_product:
        return jsonify({"error": "Product not in cart"}), 404

    db.session.delete(cart_product)
    db.session.commit()

    return jsonify({"msg": "Product removed from cart successfully!"}), 200

@marketplace_web.route('/cart/<int:buyerID>', methods=['GET'])
def get_cart(buyerID):
    """
    Fetch all products in the cart for the specified buyer.
    """
    # Fetch the cart of the buyer
    cart = Cart.query.filter_by(buyerID=buyerID).first()
    if not cart:
        return jsonify({"msg": "No items in cart."}), 200

    # Join CartProduct with Product to get the cart contents
    products_in_cart = CartProduct.query.filter_by(cartID=cart.cartID).join(
        Product, CartProduct.productID == Product.productID
    ).add_columns(
        Product.productID,
        Product.name,
        Product.price,
        Product.quantity,
        Product.images
    ).all()

    result = [
        {
            "productID": product.productID,
            "name": product.name,
            "price": product.price,
            "quantity": product.quantity,
            "images": json.loads(product.images) if isinstance(product.images, str) else product.images,
        }
        for product in products_in_cart
    ]

    return jsonify(result), 200


@marketplace_web.route('/order', methods=['POST'])
def create_order():
    # Retrieve the buyerID from the request data
    data = request.json
    buyerID = data.get("buyerID")

    if not buyerID:
        return jsonify({"error": "buyerID is required"}), 400

    # Fetch the cart for the buyer
    cart = Cart.query.filter_by(buyerID=buyerID).first()
    if not cart:
        return jsonify({"error": "Cart not found for this buyer."}), 404

    # Get the products in the cart and calculate total price
    cart_products = CartProduct.query.filter_by(cartID=cart.cartID).join(Product).all()

    total_price = 0
    product_details = []  # Optional: to store product details for logging or further use

    for cart_product in cart_products:
        product = cart_product.product  # Access the associated product using the relationship
        if not product:
            continue  # Skip this cart_product if no associated product is found

        product_price = product.price
        product_quantity = cart_product.product.quantity  # Use quantity from the product table

        # Calculate the total price for each product
        total_price += product_price * product_quantity

        # Optional: store product details for logging or debugging purposes
        product_details.append({
            "productID": product.productID,
            "name": product.name,
            "category": product.category,
            "price": product_price,
            "available_quantity": product_quantity,  # The available quantity from the product table
            "total_price_for_product": product_price * product_quantity
        })

    # Create the order
    new_order = Order(
        cartID=cart.cartID,
        totalPrice=total_price,
        orderStatus="Pending",  # Initial status
        orderDate=datetime.datetime  # Set the current date and time
    )
    db.session.add(new_order)
    db.session.commit()

    return jsonify({
        "orderID": new_order.orderID,
        "totalPrice": total_price,
        "product_details": product_details  # Optional: Include product details in the response
    }), 201