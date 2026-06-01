from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import date, timedelta
from .models import Patient

class PatientAPITests(APITestCase):
    def setUp(self):
        # Create a sample patient
        self.patient1 = Patient.objects.create(
            full_name="John Doe",
            date_of_birth=date(1990, 5, 15),
            email="john@example.com",
            glucose=90.0,
            haemoglobin=14.5,
            cholesterol=180.0
        )
        self.patient2 = Patient.objects.create(
            full_name="Jane Smith",
            date_of_birth=date(1985, 10, 22),
            email="jane@example.com",
            glucose=150.0,
            haemoglobin=13.0,
            cholesterol=250.0
        )
        self.list_create_url = reverse('patient-list')
        self.predict_url = reverse('predict_standalone')

    def test_list_patients(self):
        """Test retrieving list of patients."""
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results should be paginated
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 2)

    def test_search_patients(self):
        """Test searching patients by name or email."""
        # Search by name
        response = self.client.get(f"{self.list_create_url}?search=John")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['full_name'], "John Doe")

        # Search by email
        response = self.client.get(f"{self.list_create_url}?search=jane@example.com")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['full_name'], "Jane Smith")

    def test_retrieve_patient(self):
        """Test retrieving a single patient detail."""
        url = reverse('patient-detail', args=[self.patient1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], "John Doe")
        self.assertEqual(response.data['prediction_result'], 0) # Normal values -> Low Risk

    def test_create_patient_success(self):
        """Test creating a patient and verifying prediction auto-generation."""
        data = {
            "full_name": "Alice Cooper",
            "date_of_birth": "2000-01-01",
            "email": "alice@example.com",
            "glucose": 180.0,      # Diabetic range
            "haemoglobin": 10.5,   # Low haemoglobin (anemia)
            "cholesterol": 250.0   # High cholesterol
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['prediction_result'], 2) # High Risk
        self.assertIn("High Risk of", response.data['remarks'])

        # Verify saved in database
        patient = Patient.objects.get(email="alice@example.com")
        self.assertEqual(patient.prediction_result, 2)

    def test_create_patient_validation_errors(self):
        """Test validation rules (email, future DOB, positive vitals)."""
        # Test future date of birth
        future_dob = (date.today() + timedelta(days=1)).strftime('%Y-%m-%d')
        data = {
            "full_name": "Bob Miller",
            "date_of_birth": future_dob,
            "email": "bob@example.com",
            "glucose": 90.0,
            "haemoglobin": 14.5,
            "cholesterol": 180.0
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date_of_birth', response.data)

        # Test negative glucose value
        data = {
            "full_name": "Bob Miller",
            "date_of_birth": "1995-04-12",
            "email": "bob@example.com",
            "glucose": -5.0,
            "haemoglobin": 14.5,
            "cholesterol": 180.0
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('glucose', response.data)

    def test_update_patient_repredicts(self):
        """Test updating patient vitals triggers re-running ML prediction."""
        url = reverse('patient-detail', args=[self.patient1.id])
        # Update John's vitals to high risk levels
        update_data = {
            "full_name": "John Doe",
            "date_of_birth": "1990-05-15",
            "email": "john@example.com",
            "glucose": 190.0,
            "haemoglobin": 10.0,
            "cholesterol": 260.0
        }
        response = self.client.put(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should now be high risk
        self.assertEqual(response.data['prediction_result'], 2)
        
        # Verify db updated
        self.patient1.refresh_from_db()
        self.assertEqual(self.patient1.prediction_result, 2)

    def test_delete_patient(self):
        """Test deleting a patient."""
        url = reverse('patient-detail', args=[self.patient1.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Patient.objects.filter(id=self.patient1.id).exists())

    def test_standalone_prediction_endpoint(self):
        """Test the POST /api/predict/ endpoint."""
        # Success case
        data = {
            "glucose": 180.0,
            "haemoglobin": 10.5,
            "cholesterol": 250.0
        }
        response = self.client.post(self.predict_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['prediction_result'], 2)
        self.assertIn('remarks', response.data)

        # Validation failure (missing value)
        data = {
            "glucose": 180.0,
            "cholesterol": 250.0
        }
        response = self.client.post(self.predict_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('haemoglobin', response.data)

