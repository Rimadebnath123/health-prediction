import numpy as np
import pandas as pd
import os

def generate_health_dataset(num_samples=1500, random_seed=42):
    np.random.seed(random_seed)
    
    # Generate blood test features with realistic distributions
    # Glucose: Normal (~85-95), Prediabetic (~105-115), Diabetic (~130-220)
    # Haemoglobin: Normal (~13-16), Low/Anemic (~8-11), High (~17-19)
    # Cholesterol: Desirable (~150-190), Borderline (~210-230), High (~250-320)
    
    glucose = np.random.normal(loc=110, scale=40, size=num_samples)
    # Clip to realistic physiological bounds
    glucose = np.clip(glucose, 50, 300)
    
    haemoglobin = np.random.normal(loc=13.5, scale=2.5, size=num_samples)
    haemoglobin = np.clip(haemoglobin, 5, 20)
    
    cholesterol = np.random.normal(loc=210, scale=50, size=num_samples)
    cholesterol = np.clip(cholesterol, 100, 400)
    
    data = pd.DataFrame({
        'Glucose': glucose,
        'Haemoglobin': haemoglobin,
        'Cholesterol': cholesterol
    })
    
    # Define a risk function to calculate the ground truth labels
    # 0: Low Risk, 1: Moderate Risk, 2: High Risk
    risk_labels = []
    
    for i in range(num_samples):
        g = glucose[i]
        h = haemoglobin[i]
        c = cholesterol[i]
        
        # Calculate risk scores based on medical criteria
        risk_score = 0
        
        # Glucose risks
        if g >= 126: # Diabetic range
            risk_score += 3
        elif g >= 100: # Prediabetic range
            risk_score += 1
            
        # Cholesterol risks
        if c >= 240: # High Cholesterol
            risk_score += 3
        elif c >= 200: # Borderline
            risk_score += 1
            
        # Haemoglobin risks
        if h < 10.0 or h > 18.0: # Severe anemia or polycythemia
            risk_score += 3
        elif h < 12.0 or h > 17.0: # Mild anemia or borderline high
            risk_score += 1
            
        # Classify based on accumulated risk score
        if risk_score >= 4:
            label = 2 # High Risk
        elif risk_score >= 1:
            label = 1 # Moderate Risk
        else:
            label = 0 # Low Risk
            
        # Add a tiny amount of noise (5% chance of misclassification) to simulate real-world data complexity
        if np.random.rand() < 0.05:
            label = np.random.choice([0, 1, 2])
            
        risk_labels.append(label)
        
    data['Risk'] = risk_labels
    
    # Ensure directories exist
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(current_dir, exist_ok=True)
    
    # Save dataset
    output_path = os.path.join(current_dir, 'dataset.csv')
    data.to_csv(output_path, index=False)
    print(f"Dataset generated successfully at: {output_path}")
    print(f"Class distribution:\n{data['Risk'].value_counts()}")

if __name__ == '__main__':
    generate_health_dataset()
