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
