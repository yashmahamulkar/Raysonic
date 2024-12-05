from flask_sqlalchemy import SQLAlchemy
from wtforms import StringField, PasswordField, SelectField
from wtforms.validators import DataRequired, Email, EqualTo


from datetime import datetime
db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    gender = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(150), unique=True, nullable=False)
    phonenumber = db.Column(db.String(20), nullable=False)
    
class GenderDetection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    male_count = db.Column(db.Integer, nullable=False)
    female_count = db.Column(db.Integer, nullable=False)
    
class Cctv(db.Model):
    cctvid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    proxyaddress = db.Column(db.String(150), nullable=True)