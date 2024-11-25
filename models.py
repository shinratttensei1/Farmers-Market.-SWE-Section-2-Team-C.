from extensions import db

class User(db.Model):
    __tablename__ = 'user'

    userID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    login = db.Column(db.String(24), nullable=False)
    email = db.Column(db.String(32), nullable=False)
    password = db.Column(db.String(32), nullable=False)
    phonenumber = db.Column(db.String(11), nullable=False)
    role = db.Column(db.String(12), nullable=False)  # "farmer" or "buyer"
    isVerified = db.Column(db.Boolean, nullable=False, default=False)
    name = db.Column(db.String(64), nullable=False)


class Farmer(db.Model):
    __tablename__ = 'farmers'

    farmerID = db.Column(db.Integer, db.ForeignKey('user.userID'), primary_key=True)
    govermentIssuedID = db.Column(db.Integer, nullable=False)
    profilePicture = db.Column(db.String(64), nullable=False)
    resources = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Float, nullable=False, default=0.0)


class Buyer(db.Model):
    __tablename__ = 'buyer'

    buyerID = db.Column(db.Integer, db.ForeignKey('user.userID'), primary_key=True)
    deliveryAddress = db.Column(db.String(64), nullable=False)
    paymentMethod = db.Column(db.String(32), nullable=False)

class Farm(db.Model):
    __tablename__ = 'farms'

    farmID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    farmerID = db.Column(db.Integer, db.ForeignKey('farmers.farmerID'), nullable=False)
    farmAddress = db.Column(db.String(64), nullable=False)
    typesOfCrops = db.Column(db.String(128), nullable=False)
    farmSize = db.Column(db.Integer, nullable=False)

    # Relationship with Farmer model
    farmer = db.relationship('Farmer', backref=db.backref('farms', lazy=True))

    def __repr__(self):
        return f'<Farm {self.farmID}, Address: {self.farmAddress}, FarmerID: {self.farmerID}>'

from extensions import db


class Product(db.Model):
    __tablename__ = 'product'

    productID = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    farmerID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)

    farmer = db.relationship('User', backref='products')
