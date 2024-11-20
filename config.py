import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'biba')

    # MySQL Database Connection
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:bibaris@localhost/farmersmarket'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
