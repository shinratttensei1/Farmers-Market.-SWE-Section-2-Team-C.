import os
from flask import Flask
from config import Config
from extensions import db
from models import User, Farmer, Buyer
from routes.marketplace_routes import marketplace_web
from routes.registration_routes import registration_blueprint
from routes.admin_routes import admin_blueprint
from routes.farmer_routes import farmer_blueprint
from routes.buyer_routes import buyer_blueprint
from routes.login_routes import login_blueprint
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

db.init_app(app)

# Register blueprints
app.register_blueprint(login_blueprint, url_prefix='/auth')
app.register_blueprint(registration_blueprint, url_prefix='/auth')
app.register_blueprint(admin_blueprint, url_prefix='/admin')
app.register_blueprint(farmer_blueprint, url_prefix='/farmer')
app.register_blueprint(buyer_blueprint, url_prefix='/buyer')
app.register_blueprint(marketplace_web, url_prefix='/marketplace')

app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit to 16MB

if not os.path.exists('static/uploads'):
    os.makedirs('static/uploads')

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
