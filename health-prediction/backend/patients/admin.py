from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'glucose', 'haemoglobin', 'cholesterol', 'prediction_result', 'created_at')
    list_filter = ('prediction_result', 'created_at')
    search_fields = ('full_name', 'email')
    readonly_fields = ('prediction_result', 'remarks', 'created_at', 'updated_at')

