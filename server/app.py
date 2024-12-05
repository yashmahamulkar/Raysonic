from flask import Flask, Response, jsonify, session, redirect, url_for, flash, render_template, request,send_from_directory
from models import db, GenderDetection, User,Cctv
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from forms import SignupForm, LoginForm
import torch
from ultralytics import YOLO
from flask_socketio import SocketIO
from flask_cors import CORS
from utils import generate_frames
from threading import Event, Thread
from flask_migrate import Migrate

app = Flask(__name__)

CORS(app)
app.config.from_object(Config)

db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*")
migrate = Migrate(app, db)  # Uncomment if using Flask-Migrate

device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = YOLO("best8m275.pt").to(device)
classNames = ["female", "male"]

is_streaming_event = Event()
is_streaming_event.set()
stream_thread = None

with app.app_context():
    db.create_all()

@app.route('/homepagedata', methods=['GET'])
def homepage():
    username = session.get('username')
    male_count = db.session.query(GenderDetection).filter(GenderDetection.male_count > 0).count()
    female_count = db.session.query(GenderDetection).filter(GenderDetection.female_count > 0).count()
    total_people = male_count + female_count

    return jsonify({
        'username': username,
        'total_people': total_people,
        'male_count': male_count,
        'female_count': female_count
    })

@app.route('/video_feed')
def video_feed():
    global stream_thread
    if not is_streaming_event.is_set():
        is_streaming_event.set()
        if stream_thread is None or not stream_thread.is_alive():
            stream_thread = Thread(target=lambda: Response(generate_frames(app, db, is_streaming_event), mimetype='multipart/x-mixed-replace; boundary=frame'))
            stream_thread.start()
    return Response(generate_frames(app, db, is_streaming_event), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stop_feed', methods=['POST'])
def stop_feed():
    global is_streaming_event
    is_streaming_event.clear()  # Signal the thread to stop streaming
    if stream_thread and stream_thread.is_alive():
        stream_thread.join()  # Wait for the thread to finish
    return jsonify({"status": "Camera stopped"}), 200

@app.route('/chartdata')
def get_data():
    data = db.session.query(GenderDetection).order_by(GenderDetection.timestamp).all()
    chart_data = {
        "timestamps": [entry.timestamp.strftime('%Y-%m-%d %H:%M:%S') for entry in data],
        "male_count": [entry.male_count for entry in data],
        "female_count": [entry.female_count for entry in data]
    }
    return jsonify(chart_data)

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = db.session.query(User).filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        session['username'] = user.username
        return jsonify({"status": "success", "username": user.username}), 200
    return jsonify({"status": "error", "message": "Invalid email or password"}), 401

@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    email = data.get('email')
    password = generate_password_hash(data.get('password'), method='sha256')
    confirm_password = data.get('confirm_password')
    username = data.get('username')
    gender = data.get('gender')
    phonenumber = data.get('phonenumber')

    if password != confirm_password:
        return jsonify({"status": "error", "message": "Passwords do not match."}), 400

    new_user = User(email=email, password=password, username=username, gender=gender, phonenumber=phonenumber)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"status": "success", "message": "Account created successfully!"}), 201

@app.route('/')
def default():
    return render_template('index.html')

    # Render the signup page
    
@app.route('/signup', methods=['POST'])
def signup():
    data = request.form  # Retrieve form data

    # Debugging: Print form data
    print("Received form data:", data)

    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')
    gender = data.get('gender')
    username = data.get('username')
    phonenumber = data.get('phonenumber')

    # Debugging: Print the individual fields
    print("Email:", email)
    print("Password:", password)
    print("Confirm Password:", confirm_password)
    print("Gender:", gender)
    print("Username:", username)
    print("Phone Number:", phonenumber)

    # Check if any field is missing
    if not all([email, password, confirm_password, gender, username, phonenumber]):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    # Check if passwords match
    if password != confirm_password:
        return jsonify({'status': 'error', 'message': 'Passwords do not match'}), 400

    # Hash the password for security
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    # Create a new user instance
    new_user = User(email=email, password=hashed_password, gender=gender, username=username, phonenumber=phonenumber)

    try:
 
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Signup successful! Please log in.'}), 200
    except Exception as e:
        db.session.rollback()
     
        print(f"Exception occurred: {e}")
        return jsonify({'status': 'error', 'message': 'Email already exists. Please use a different email.'}), 400
@app.route('/cctvdata', methods=['GET'])
def get_cctvs():
    cctvs = db.session.query(Cctv).all()
    cctv_list = [
        {
            'cctvid': cctv.cctvid,
            'latitude': cctv.latitude,
            'longitude': cctv.longitude,
            'status': cctv.status,
            'proxyaddress': cctv.proxyaddress
        }
        for cctv in cctvs
    ]
    return jsonify(cctv_list)


@app.route('/api/cctv', methods=['POST'])
def add_cctv():
    
    cctvs = db.session.query(Cctv).all()
    cctv_list = [
        {
            'cctvid': cctv.cctvid,
            'latitude': cctv.latitude,
            'longitude': cctv.longitude,
            'status': cctv.status,
            'proxyaddress': cctv.proxyaddress
        }
        for cctv in cctvs
    ]
    # Assuming cctv_list is your list of CCTV dictionaries
    if cctv_list:
        last_cctv_proxyaddress = cctv_list[-1]['proxyaddress']
        print("Last CCTV proxyaddress:", last_cctv_proxyaddress)
    else:
        print("No CCTV records found.")

    data = request.get_json()

    latitude = data.get('latitude')
    longitude = data.get('longitude')
    status = "active"


    if not latitude or not longitude or not status:
        return jsonify({"status": "error", "message": "All required fields must be provided"}), 400

    new_cctv = Cctv(latitude=latitude, longitude=longitude, status=status, proxyaddress=last_cctv_proxyaddress+1)
    try:
        db.session.add(new_cctv)
        db.session.commit()
        return jsonify({"status": "success", "message": "CCTV added successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/policestations')
def get_police_stations():
    return send_from_directory('static', 'policestations.json')



if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
