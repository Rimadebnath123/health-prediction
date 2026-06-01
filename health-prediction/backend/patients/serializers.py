from rest_framework import serializers
from datetime import date
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'id', 
            'full_name', 
            'date_of_birth', 
            'email', 
            'glucose', 
            'haemoglobin', 
            'cholesterol', 
            'prediction_result', 
            'remarks', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['prediction_result', 'remarks', 'created_at', 'updated_at']

    def validate_date_of_birth(self, value):
        if value > date.today():
            raise serializers.ValidationError("Date of birth cannot be a future date.")
        return value

    def validate_glucose(self, value):
        if value <= 0:
            raise serializers.ValidationError("Glucose value must be a positive number.")
        return value

    def validate_haemoglobin(self, value):
        if value <= 0:
            raise serializers.ValidationError("Haemoglobin value must be a positive number.")
        return value

    def validate_cholesterol(self, value):
        if value <= 0:
            raise serializers.ValidationError("Cholesterol value must be a positive number.")
        return value
