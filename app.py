from flask import Flask
from config import Config
from extensions import db
from models import User, Farmer, Buyer
from routes.marketplace_routes import marketplace_blueprint
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

app.register_blueprint(login_blueprint, url_prefix='/auth')
app.register_blueprint(registration_blueprint, url_prefix='/auth')
app.register_blueprint(admin_blueprint, url_prefix='/admin')
app.register_blueprint(farmer_blueprint, url_prefix='/farmer')
app.register_blueprint(buyer_blueprint, url_prefix='/buyer')
app.register_blueprint(marketplace_blueprint, url_prefix='/marketplace')


with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)