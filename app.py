import os
from flask import Flask, request, make_response
from config import Config
from extensions import db
from flask_cors import CORS

# Import routes
from routes.marketplace_routes import marketplace_web
from routes.registration_routes import registration_blueprint
from routes.admin_routes import admin_blueprint
from routes.farmer_routes import farmer_blueprint
from routes.buyer_routes import buyer_blueprint
from routes.login_routes import login_blueprint
from routes.user_routes import user_blueprint

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize database
db.init_app(app)

# Enable CORS globally with specific configuration
CORS(app, resources={r"/*": {"origins": "http://localhost:8081"}},
     methods=["GET", "POST", "OPTIONS", "DELETE"],
     allow_headers=["Content-Type", "Authorization"])

# Handle preflight requests explicitly
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:8081")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        return response, 200

# Register blueprints
app.register_blueprint(login_blueprint, url_prefix='/auth')
app.register_blueprint(registration_blueprint, url_prefix='/auth')
app.register_blueprint(admin_blueprint, url_prefix='/admin')
app.register_blueprint(farmer_blueprint, url_prefix='/farmer')
app.register_blueprint(buyer_blueprint, url_prefix='/buyer')
app.register_blueprint(marketplace_web, url_prefix='/marketplace')
app.register_blueprint(user_blueprint, url_prefix='/user')

# Configure upload settings
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit to 16MB

# Ensure upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Initialize database tables
with app.app_context():
    db.create_all()

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
