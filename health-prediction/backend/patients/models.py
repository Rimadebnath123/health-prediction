from django.db import models
from ml.predict import predict_health_risk

class Patient(models.Model):
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    email = models.EmailField(unique=True)
    glucose = models.FloatField()
    haemoglobin = models.FloatField()
    cholesterol = models.FloatField()
    prediction_result = models.IntegerField(blank=True, null=True)  # 0: Low Risk, 1: Moderate Risk, 2: High Risk
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Run prediction dynamically using the ML model before saving
        pred, remark = predict_health_risk(self.glucose, self.haemoglobin, self.cholesterol)
        self.prediction_result = pred
        self.remarks = remark
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.email})"

