# HealthPredict AI

HealthPredict AI is a full-stack healthcare application that predicts a patient's health risk level (Low, Moderate, or High) using blood test parameters such as fasting glucose, haemoglobin, and cholesterol levels.

The application combines a React frontend with a Django REST Framework backend and uses a machine learning model built with Scikit-Learn to generate predictions. Patient records are stored in SQLite, and predictions are automatically generated whenever a new patient is added or existing health data is updated.

## Tech Stack

* Frontend: React.js, Vite, Bootstrap 5, Axios
* Backend: Django, Django REST Framework
* Machine Learning: Scikit-Learn, Pandas, NumPy
* Database: SQLite

## Key Features

* Predict patient health risk levels using ML
* Add, edit, view, and delete patient records
* Automatic risk assessment and health remarks
* Search, sort, and paginate patient records
* Dashboard with patient statistics and recent predictions
* RESTful API for patient management and predictions

## Running the Project

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

* `GET /api/patients/` – List patients
* `POST /api/patients/` – Add a new patient
* `GET /api/patients/<id>/` – View patient details
* `PUT /api/patients/<id>/` – Update patient information
* `DELETE /api/patients/<id>/` – Delete a patient
* `GET /api/patients/stats/` – Dashboard statistics
* `POST /api/predict/` – Get a health risk prediction without saving data

This project demonstrates full-stack development by integrating React, Django REST Framework, and Machine Learning into a healthcare prediction system.

