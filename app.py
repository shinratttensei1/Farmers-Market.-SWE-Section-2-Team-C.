from flask import Flask
from config import Config
from extensions import db
from models import User, Farmer, Buyer
from routes.registration_routes import registration_blueprint
from routes.admin_routes import admin_blueprint  # Import the admin blueprint

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)

# Register blueprints
app.register_blueprint(registration_blueprint, url_prefix='/auth')
app.register_blueprint(admin_blueprint, url_prefix='/admin')  # Register admin routes

# Create database tables (for testing purposes only)
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
