import time
from models import GenderDetection
import cv2
from ultralytics import YOLO
import math
import torch
from flask_socketio import SocketIO,emit
import base64


device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = YOLO("best8m275.pt").to(device)
classNames = ["female", "male"]
def generate_frames(app, db, is_streaming_event):
    cap = cv2.VideoCapture(0)
    cap.set(3, 640)
    cap.set(4, 480)

    last_interval_time = time.time()
    max_male_count = 0
    max_female_count = 0

    while is_streaming_event.is_set():
        success, img = cap.read()
        if not success:
            break

        # Process the frame (YOLO detection, etc.)
        img_resized = cv2.resize(img, (640, 640))
        img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        img_tensor = torch.tensor(img_rgb).permute(2, 0, 1).unsqueeze(0).float().to(device)
        results = model.predict(img_tensor, stream=True, conf=0.55)

        male_count = 0
        female_count = 0

        for r in results:
            boxes = r.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                confidence = round(box.conf[0].item() * 100) / 100
                if confidence > 0.3:
                    cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 255), 3)
                    cls = int(box.cls[0])
                    org = [x1, y1]
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    fontScale = 1
                    thickness = 2

                    if classNames[cls] == "male":
                        male_count += 1
                        cv2.putText(img, classNames[cls], org, font, fontScale, (255, 0, 0), thickness)
                    elif classNames[cls] == "female":
                        female_count += 1
                        cv2.putText(img, classNames[cls], org, font, fontScale, (0, 0, 255), thickness)

        # Update the maximum counts within the 5-second interval
        max_male_count = max(max_male_count, male_count)
        max_female_count = max(max_female_count, female_count)

        counter_text = f"Males: {male_count}  Females: {female_count}"
        cv2.putText(img, counter_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

        # Save data to the database every 5 seconds
        current_time = time.time()
        if current_time - last_interval_time >= 5:
            with app.app_context():
                detection_record = GenderDetection(male_count=max_male_count, female_count=max_female_count)
                db.session.add(detection_record)
                db.session.commit()

            last_interval_time = current_time
            max_male_count = 0
            max_female_count = 0

        ret, buffer = cv2.imencode('.jpg', img)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()


def generate_frames2(app,db,socketio):
    cap = cv2.VideoCapture(1)  # Camera index 0
    cap.set(3, 640)  # Set width
    cap.set(4, 480)  # Set height

    last_interval_time = time.time()

    # Initialize max counts for the 5-second interval
    max_male_count = 0
    max_female_count = 0

    try:
        while True:
            success, img = cap.read()  # Capture the current frame
            if not success:
                print("Failed to grab frame")
                continue

            # Run YOLO model on the frame
            img_resized = cv2.resize(img, (640, 640))
            img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
            img_tensor = torch.tensor(img_rgb).permute(2, 0, 1).unsqueeze(0).float().to(device)

            # Run prediction
            results = model.predict(img_tensor, stream=True, conf=0.55)

            male_count = 0
            female_count = 0

            for r in results:
                boxes = r.boxes
                for box in boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    confidence = round(box.conf[0] * 100) / 100

                    if confidence > 0.3:
                        cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 255), 3)
                        cls = int(box.cls[0])
                        org = [x1, y1]
                        font = cv2.FONT_HERSHEY_SIMPLEX
                        fontScale = 1
                        thickness = 2

                        if classNames[cls] == "male":
                            male_count += 1
                            cv2.putText(img, classNames[cls], org, font, fontScale, (255, 0, 0), thickness)
                        elif classNames[cls] == "female":
                            female_count += 1
                            cv2.putText(img, classNames[cls], org, font, fontScale, (0, 0, 255), thickness)

            # Update the maximum counts within the 5-second interval
            max_male_count = max(max_male_count, male_count)
            max_female_count = max(max_female_count, female_count)

            counter_text = f"Males: {male_count}  Females: {female_count}"
            cv2.putText(img, counter_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

            # Save data to the database every 5 seconds
            current_time = time.time()
            if current_time - last_interval_time >= 5:
                with app.app_context():
                    detection_record = GenderDetection(male_count=max_male_count, female_count=max_female_count)
                    db.session.add(detection_record)
                    db.session.commit()

                # Reset for the next 5-second interval
                last_interval_time = current_time
                max_male_count = 0
                max_female_count = 0

            # Encode the frame in JPEG format and send it over WebSocket
            ret, buffer = cv2.imencode('.jpg', img)
            if not ret:
                print("Failed to encode frame")
                continue

            #frame_encoded = base64.b64encode(buffer).decode('utf-8')
            #socketio.emit('video_feed', {'frame': frame_encoded})
            time.sleep(0.05)  # Adjust for frame rate control
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        cap.release()