from flask import Blueprint, request, jsonify
from models import db, Farmer, User, Buyer, Farm

admin_blueprint = Blueprint('admin', __name__)

@admin_blueprint.route('/test', methods=['GET'])
def test_admin():
    return jsonify({"msg": "Admin route is working!"})


@admin_blueprint.route('/pending-farmers', methods=['GET'])
def get_pending_farmers():
    # Query farmers who are not verified
    pending_farmers = db.session.query(User, Farmer).join(Farmer).filter(User.isVerified == False).all()
    response = []
    for user, farmer in pending_farmers:
        response.append({
            "farmerID": farmer.farmerID,
            "name": user.name,
            "email": user.email,
            "phonenumber": user.phonenumber,
            "govID": farmer.govermentIssuedID,
            "resources": farmer.resources,
            "rating": farmer.rating,
        })
    return jsonify(response), 200

@admin_blueprint.route('/approve-user/<int:userID>', methods=['GET', 'PUT'])
def approve_user(userID):
    user = User.query.get(userID)
    if not user or user.role != 'farmer':
        return jsonify({"msg": "User not found or invalid role"}), 404

    user.isVerified = True
    db.session.commit()
    return jsonify({"msg": f"{user.name} has been approved!"}), 200

@admin_blueprint.route('/reject-user/<int:userID>', methods=['GET', 'DELETE'])
def reject_user(userID):
    user = User.query.get(userID)
    if not user or user.role != 'farmer':
        return jsonify({"msg": "User not found or invalid role"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": f"{user.name} has been rejected and removed!"}), 200


from flask_jwt_extended import create_access_token

@admin_blueprint.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"msg": "Invalid credentials"}), 401

    # Create JWT token
    access_token = create_access_token(identity={"userID": user.userID, "role": user.role})
    return jsonify({"access_token": access_token}), 200

# routes/admin_routes.py
from flask import Blueprint, jsonify, render_template

admin_blueprint = Blueprint('admin', __name__)

@admin_blueprint.route('/dashboard', methods=['GET'])
def admin_dashboard():
    # Query for unverified farmers (pending approval)
    pending_farmers = db.session.query(User, Farmer).filter(
        User.userID == Farmer.farmerID,
        User.isVerified == False
    ).all()

    # Query for all verified farmers
    registered_farmers = db.session.query(User, Farmer).filter(
        User.userID == Farmer.farmerID,
        User.isVerified == True
    ).all()

    # Query for all buyers (optional, for informational purposes)
    all_buyers = User.query.filter_by(role='buyer').all()

    return render_template(
        'admin_dashboard.html',
        pending_farmers=pending_farmers,
        registered_farmers=registered_farmers,
        all_buyers=all_buyers
    )


@admin_blueprint.route('/approve-user/<int:user_id>', methods=['PUT'])
def approve_user(user_id):
    user = User.query.get(user_id)
    if not user or user.role != 'farmer':
        return jsonify({"error": "User not found or invalid role"}), 404

    user.isVerified = True
    db.session.commit()
    return jsonify({"msg": f"User '{user.name}' approved successfully!"}), 200


@admin_blueprint.route('/reject-user/<int:user_id>', methods=['DELETE'])
def reject_user(user_id):
    user = User.query.get(user_id)
    if not user or user.role != 'farmer':
        return jsonify({"error": "User not found or invalid role"}), 404

    # Delete related farmer entry if exists
    farmer = Farmer.query.filter_by(farmerID=user.userID).first()
    if farmer:
        db.session.delete(farmer)

    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": f"User '{user.name}' rejected and removed!"}), 200

@admin_blueprint.route('/delete-user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    # Fetch the user
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # If the user is a farmer, delete the farmer entry
    if user.role == 'farmer':
        farmer = Farmer.query.filter_by(farmerID=user.userID).first()
        if farmer:
            db.session.delete(farmer)

    # If the user is a buyer, delete the buyer entry
    if user.role == 'buyer':
        buyer = Buyer.query.filter_by(buyerID=user.userID).first()
        if buyer:
            db.session.delete(buyer)

    # Delete the user
    db.session.delete(user)
    db.session.commit()

    return jsonify({"msg": f"User '{user.name}' deleted successfully!"}), 200

@admin_blueprint.route('/admin/farms/<int:farmer_id>', methods=['GET'])
def get_farms(farmer_id):
    try:
        # Fetch farmer and user details
        farmer = Farmer.query.get(farmer_id)
        user = User.query.get(farmer_id)  # Assuming Farmer and User share the same ID
        if not farmer or not user:
            return render_template('error.html', message="Farmer not found"), 404

        # Fetch farms for the farmer
        farms = Farm.query.filter_by(farmerID=farmer_id).all()

        # Render the farmer details page with farms
        return render_template('farmer_details.html', farmer=farmer, user=user, farms=farms)
    except Exception as e:
        logging.error(f"Error occurred for farmer ID {farmer_id}: {e}")
        return render_template('error.html', message="An unexpected error occurred."), 500
