import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix, classification_report

def train_and_evaluate_models():
    # Load dataset dynamically relative to this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, 'dataset.csv')
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Please run generate_dataset.py first.")
        
    df = pd.read_csv(dataset_path)
    print("Dataset Loaded. Shape:", df.shape)
    
    # Split features and target
    X = df[['Glucose', 'Haemoglobin', 'Cholesterol']]
    y = df['Risk']
    
    # Train-test split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Define models to evaluate
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42)
    }
    
    best_model_name = None
    best_accuracy = 0.0
    best_pipeline = None
    
    results = {}
    
    for name, model in models.items():
        print(f"\n--- Training {name} ---")
        # Build pipeline: scaling then modeling
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', model)
        ])
        
        # Train
        pipeline.fit(X_train, y_train)
        
        # Predict
        y_pred = pipeline.predict(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted')
        recall = recall_score(y_test, y_pred, average='weighted')
        conf_matrix = confusion_matrix(y_test, y_pred)
        
        print(f"Accuracy:  {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall:    {recall:.4f}")
        print("Confusion Matrix:\n", conf_matrix)
        print("Classification Report:\n", classification_report(y_test, y_pred))
        
        results[name] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'pipeline': pipeline
        }
        
        # Track the best model based on accuracy
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_model_name = name
            best_pipeline = pipeline
            
    print(f"\n==========================================")
    print(f"Best Performing Model: {best_model_name} with Accuracy {best_accuracy:.4f}")
    print(f"==========================================")
    
    # Ensure models directory exists in the backend relative to this script
    models_dir = os.path.join(current_dir, '..', 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    # Save the best model pipeline
    model_save_path = os.path.join(models_dir, 'health_prediction_model.pkl')
    joblib.dump(best_pipeline, model_save_path)
    print(f"Saved best model pipeline to: {model_save_path}")

if __name__ == '__main__':
    train_and_evaluate_models()
