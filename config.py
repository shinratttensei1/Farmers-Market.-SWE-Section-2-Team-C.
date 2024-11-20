import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'biba')

    # MySQL Database Connection
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://sql7746150:hPpSM1pFIN@sql7.freesqldatabase.com/sql7746150'
    SQLALCHEMY_TRACK_MODIFICATIONS = False


