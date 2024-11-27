import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'biba')

    # MySQL Database Connection
    # SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://sql7746150:hPpSM1pFIN@sql7.freesqldatabase.com/sql7746150'
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://sql7747957:aP3lKUJlpj@sql7.freesqldatabase.com/sql7747957"

    # SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://sersidw:Njktuty228@sersidw.mysql.pythonanywhere-services.com/sersidw$farmersmarket'

    SQLALCHEMY_TRACK_MODIFICATIONS = False