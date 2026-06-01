from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Patient
from .serializers import PatientSerializer
from ml.predict import predict_health_risk

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet to handle Patient CRUD operations.
    Supports searching by name and email, and ordering by various fields.
    """
    queryset = Patient.objects.all().order_by('-created_at')
    serializer_class = PatientSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['full_name', 'email']
    ordering_fields = ['full_name', 'created_at', 'prediction_result', 'glucose', 'haemoglobin', 'cholesterol']
    ordering = ['-created_at']

    @action(detail=False, methods=['GET'])
    def stats(self, request):
        """
        Custom action to return high-level dashboard metrics.
        """
        total_patients = Patient.objects.count()
        high_risk_patients = Patient.objects.filter(prediction_result=2).count()
        moderate_risk_patients = Patient.objects.filter(prediction_result=1).count()
        low_risk_patients = Patient.objects.filter(prediction_result=0).count()

        # Retrieve the 5 most recent predictions
        recent_patients = Patient.objects.all().order_by('-created_at')[:5]
        recent_serializer = PatientSerializer(recent_patients, many=True)

        return Response({
            "total_patients": total_patients,
            "high_risk_patients": high_risk_patients,
            "moderate_risk_patients": moderate_risk_patients,
            "low_risk_patients": low_risk_patients,
            "recent_predictions": recent_serializer.data
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
def predict_risk_standalone(request):
    """
    Standalone API endpoint to predict health risk from blood values.
    Does not save results to the database.
    """
    glucose = request.data.get('glucose')
    haemoglobin = request.data.get('haemoglobin')
    cholesterol = request.data.get('cholesterol')
    
    # Request field validation
    errors = {}
    if glucose is None or glucose == '':
        errors['glucose'] = ["This field is required."]
    if haemoglobin is None or haemoglobin == '':
        errors['haemoglobin'] = ["This field is required."]
    if cholesterol is None or cholesterol == '':
        errors['cholesterol'] = ["This field is required."]
        
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        
    # Numeric and bounds validation
    try:
        g = float(glucose)
        h = float(haemoglobin)
        c = float(cholesterol)
    except (ValueError, TypeError):
        return Response({"detail": "Blood test values must be numeric"}, status=status.HTTP_400_BAD_REQUEST)
        
    if g <= 0 or h <= 0 or c <= 0:
        return Response({"detail": "Blood test values must be positive numbers"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        pred, remark = predict_health_risk(g, h, c)
        return Response({
            "glucose": g,
            "haemoglobin": h,
            "cholesterol": c,
            "prediction_result": pred,
            "remarks": remark
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

