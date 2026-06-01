# HealthPredict AI - Full-Stack Health Risk Prediction Application

HealthPredict AI is a modern healthcare web application that predicts a patient's health risk level (Low, Moderate, High) based on key blood test metrics: Fasting Glucose, Haemoglobin, and Total Cholesterol. The application leverages a custom Machine Learning Decision Forest Classifier trained using Python and Scikit-Learn.

The solution provides a fully integrated Django REST Framework (DRF) backend, SQLite database storage, and a responsive React.js frontend styled with modern Bootstrap 5 and Lucide icons.

---

## Technical Stack

* **Frontend**: React.js, React Router v6, Axios, Bootstrap 5, Lucide Icons, Vite
* **Backend**: Django, Django REST Framework, django-cors-headers
* **Machine Learning**: Scikit-Learn, Pandas, NumPy, Joblib
* **Database**: SQLite3

---

## Directory Structure

```
health-prediction/
├── backend/
│   ├── config/                  # Django project configuration (settings.py, urls.py)
│   ├── db.sqlite3               # SQLite Database
│   ├── manage.py
│   ├── ml/
│   │   ├── dataset.csv          # Generated healthcare dataset (1,500 samples)
│   │   ├── generate_dataset.py  # Python script to generate realistic medical telemetry
│   │   ├── predict.py           # Evaluation helper script loading saved pipeline
│   │   └── train_model.py       # Classifier model training and evaluation script
│   ├── models/
│   │   └── health_prediction_model.pkl  # Serialized best Scikit-learn Pipeline (Scaler + RF)
│   ├── patients/
│   │   ├── models.py            # Patient DB Model with auto-predict on save
│   │   ├── serializers.py       # Patient input serializer and field validators
│   │   ├── tests.py             # APITestCases for validation, CRUD, and predict endpoint
│   │   ├── urls.py              # Router endpoint maps
│   │   └── views.py             # Patient CRUD ViewSet and standalone predict endpoint
│   └── requirements.txt         # Backend Python dependencies
└── frontend/
    ├── package.json
    ├── src/
    │   ├── App.css
    │   ├── App.jsx              # Routing and Bootstrap loader
    │   ├── index.css            # Typography and custom micro-animations
    │   ├── main.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx       # Header Navigation
    │   │   └── PredictionBadge.jsx # Color-coded risk status badge
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Metrics and recent predictions list
    │   │   ├── AddPatient.jsx   # Register patient form
    │   │   ├── EditPatient.jsx  # Edit patient form (re-runs predictions)
    │   │   ├── PatientList.jsx  # Patient list table with search, pagination, and sorting
    │   │   └── PatientDetail.jsx# Complete diagnostics and clinical remarks view
    │   └── services/
    │       └── api.js           # Axios endpoint maps
    └── vite.config.js
```

---

## Setup Instructions

### 1. Prerequisites
Ensure you have the following installed:
* Python 3.10+
* Node.js v18+ and npm

---

### 2. Backend Setup & ML Model Training

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   * **Windows**:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Train the ML Model:
   Run the training pipeline which generates the medical dataset, evaluates Logistic Regression, Decision Tree, and Random Forest, and saves the best model:
   ```bash
   python ml/generate_dataset.py
   python ml/train_model.py
   ```
   *Note: Random Forest achieves ~95.6% validation accuracy and is automatically serialized to `models/health_prediction_model.pkl`.*

5. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Run backend unit tests:
   ```bash
   python manage.py test
   ```

7. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   *The server runs locally at `http://127.0.0.1:8000/`.*

---

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will run locally at `http://localhost:5173/`.*

---

## API Specifications

All endpoints are mounted under `/api/`.

### 1. Patient Directory CRUD
* `GET /api/patients/` - List patients. Supported query parameters:
  * `page` (integer): Page number for pagination (10 items per page).
  * `search` (string): Filters patients by name or email.
  * `ordering` (string): Orders logs by `full_name`, `created_at`, `prediction_result`, `glucose`, `haemoglobin`, or `cholesterol`.
* `POST /api/patients/` - Add a patient. Sends vitals directly to the ML model, stores result & remarks, and saves to DB.
  * *Request Body*:
    ```json
    {
      "full_name": "Alice Cooper",
      "date_of_birth": "2000-01-01",
      "email": "alice@example.com",
      "glucose": 180.0,
      "haemoglobin": 10.5,
      "cholesterol": 250.0
    }
    ```
* `GET /api/patients/<id>/` - Retrieve a single patient profile with detailed diagnostics.
* `PUT /api/patients/<id>/` - Edit a patient record. Re-runs prediction on new blood values and updates DB.
* `DELETE /api/patients/<id>/` - Remove patient record.

### 2. Analytics & Standalone Prediction
* `GET /api/patients/stats/` - Aggregate metrics (Total, High/Mod/Low Risk patient counts) and the 5 most recent registrations.
* `POST /api/predict/` - Standalone prediction. Returns results immediately without database persistence.
  * *Request Body*:
    ```json
    {
      "glucose": 120.0,
      "haemoglobin": 14.5,
      "cholesterol": 210.0
    }
    ```
  * *Response Body*:
    ```json
    {
      "glucose": 120.0,
      "haemoglobin": 14.5,
      "cholesterol": 210.0,
      "prediction_result": 1,
      "remarks": "Moderate Risk due to borderline high glucose (Prediabetes range), borderline high cholesterol. Diet and lifestyle modifications recommended."
    }
    ```
