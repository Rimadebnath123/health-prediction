import os
import joblib
import numpy as np

# Resolve path relative to this script to make it importable from anywhere
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, '..', 'models', 'health_prediction_model.pkl')

_model_pipeline = None

def get_model():
    global _model_pipeline
    if _model_pipeline is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found at: {os.path.abspath(MODEL_PATH)}. "
                "Please run train_model.py first."
            )
        _model_pipeline = joblib.load(MODEL_PATH)
    return _model_pipeline

def predict_health_risk(glucose, haemoglobin, cholesterol):
    """
    Predicts health risk and returns a numeric result and a descriptive remark.
    
    Parameters:
    - glucose (float): Blood glucose level (mg/dL)
    - haemoglobin (float): Haemoglobin level (g/dL)
    - cholesterol (float): Total cholesterol level (mg/dL)
    
    Returns:
    - tuple: (prediction_class_int, remark_str)
      prediction_class: 0 (Low Risk), 1 (Moderate Risk), 2 (High Risk)
    """
    # Validate types and values
    try:
        glucose = float(glucose)
        haemoglobin = float(haemoglobin)
        cholesterol = float(cholesterol)
    except (ValueError, TypeError):
        raise ValueError("Blood test values must be numeric")
        
    if glucose <= 0 or haemoglobin <= 0 or cholesterol <= 0:
        raise ValueError("Blood test values must be positive numbers")

    # Load model and make prediction
    pipeline = get_model()
    input_data = np.array([[glucose, haemoglobin, cholesterol]])
    
    # Predict risk class
    prediction = int(pipeline.predict(input_data)[0])
    
    # Generate clinical remarks based on prediction and specific blood metrics
    remarks = ""
    if prediction == 2: # High Risk
        conditions = []
        if glucose >= 126.0:
            conditions.append("Diabetes")
        if cholesterol >= 240.0:
            conditions.append("Cardiovascular Disease")
        if haemoglobin < 11.0:
            conditions.append("Severe Anemia")
        elif haemoglobin > 18.0:
            conditions.append("Polycythemia (High Haemoglobin)")
            
        if len(conditions) > 0:
            # Join conditions gracefully
            if len(conditions) == 1:
                remarks = f"High Risk of {conditions[0]}"
            elif len(conditions) == 2:
                remarks = f"High Risk of {conditions[0]} and {conditions[1]}"
            else:
                remarks = f"High Risk of {', '.join(conditions[:-1])}, and {conditions[-1]}"
        else:
            remarks = "High Risk profile. Detailed clinical assessment recommended."
            
    elif prediction == 1: # Moderate Risk
        conditions = []
        if 100.0 <= glucose < 126.0:
            conditions.append("borderline high glucose (Prediabetes range)")
        if 200.0 <= cholesterol < 240.0:
            conditions.append("borderline high cholesterol")
        if 11.0 <= haemoglobin < 12.0:
            conditions.append("mild anemia (slightly low haemoglobin)")
        elif 17.0 < haemoglobin <= 18.0:
            conditions.append("slightly elevated haemoglobin")
            
        if len(conditions) > 0:
            remarks = f"Moderate Risk due to {', '.join(conditions)}. Diet and lifestyle modifications recommended."
        else:
            remarks = "Moderate Risk. Diet and lifestyle modifications recommended. Re-test in 3 months."
            
    else: # Low Risk
        remarks = "Normal Health Profile. Low risk detected."
        
    return prediction, remarks

# Simple execution test
if __name__ == '__main__':
    # Test high risk case
    try:
        pred, remark = predict_health_risk(180, 10.5, 250)
        print(f"Test case: Glucose=180, Hb=10.5, Chol=250")
        print(f"Prediction: {pred}, Remark: {remark}")
    except Exception as e:
        print("Error during test run:", e)
