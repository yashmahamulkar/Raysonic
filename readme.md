# Raysonic

A full-stack project Women Safety Project using Flask for the backend (`server`) and React for the frontend (`client`).

---

## Structure
The project is organized into two main directories:

1. **`client/`** - Contains the React frontend.
2. **`server/`** - Contains the Flask backend.

---

## Prerequisites
Ensure you have the following installed:

- Node.js and npm (for the React client)
- Python 3.9+ (for the Flask server)
- Git (to manage the repository)

---

## Setup Instructions

### **1. Clone the Repository**
```bash
git clone https://github.com/yashmahamulkar/Raysonic.git
cd Raysonic
```

### **2. Setting Up the Client**

Navigate to the `client` directory and install dependencies:
```bash
cd client
npm install
```

Start the development server:
```bash
npm start
```
The client will run at [http://localhost:3000](http://localhost:3000).

### **3. Setting Up the Server**

Navigate to the `server` directory and set up a virtual environment:
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install the required Python packages:
```bash
pip install -r requirements.txt
```

Run the Flask server:
```bash
python app.py
```
The server will run at [http://localhost:5000](http://localhost:5000).

---

## Communication Between Client and Server

By default, the React client is configured to send API requests to the Flask backend. Update the `client/src/config.js` file if the backend URL changes:
```javascript
const API_BASE_URL = 'http://localhost:5000';
export default API_BASE_URL;
```

---

## Deployment

### **Client**
Build the React app for production:
```bash
npm run build
```
Deploy the contents of the `client/build/` folder to your hosting service.

### **Server**
Deploy the Flask app to a hosting platform (e.g., Heroku, AWS, or Google Cloud). Ensure the `requirements.txt` and `.env` files are correctly configured.

---

## Contributing

1. Fork the repository.
2. Create a new branch for your feature/bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

