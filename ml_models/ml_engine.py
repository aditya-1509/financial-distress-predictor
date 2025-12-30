"""
ML Engine: CatBoost Classifier with SHAP Explainability
Production-grade machine learning pipeline for financial distress prediction
"""

import pandas as pd
import numpy as np
import joblib
import json
from pathlib import Path

# ML Libraries
from catboost import CatBoostClassifier, Pool
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import (classification_report, confusion_matrix, 
                            accuracy_score, precision_recall_fscore_support,
                            roc_auc_score)
from sklearn.preprocessing import LabelEncoder

# SHAP for explainability
import shap
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import base64
from io import BytesIO

class FinancialDistressPredictor:
    """
    Production ML Engine for Financial Distress Prediction
    Uses CatBoost for classification and SHAP for explainability
    """
    
    def __init__(self, model_dir='../ml_models'):
        """Initialize the predictor."""
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True, parents=True)
        
        self.model = None
        self.feature_columns = None
        self.categorical_features = None
        self.label_encoder = LabelEncoder()
        self.explainer = None
        self.feature_importance = None
        
    def prepare_data(self, df, target_col='Financial_Distress_Encoded'):
        """Prepare data for training."""
        print("\n🔧 Preparing Data for ML Pipeline...")
        
        # Separate features and target
        exclude_cols = ['Household_ID', 'Financial_Distress', target_col, 
                       'Survey_Year', 'Survey_Quarter']
        feature_cols = [col for col in df.columns if col not in exclude_cols]
        
        X = df[feature_cols].copy()
        y = df[target_col].copy()
        
        # Identify categorical features
        self.categorical_features = X.select_dtypes(include=['object']).columns.tolist()
        print(f"   Categorical features: {self.categorical_features}")
        
        # Store feature columns
        self.feature_columns = feature_cols
        
        print(f"✅ Data prepared: {X.shape[0]} samples, {X.shape[1]} features")
        return X, y
    
    def train(self, X, y, optimize_for_recall=True):
        """
        Train CatBoost model with cross-validation.
        Optimize for recall on High Distress class.
        """
        print("\n🤖 Training CatBoost Classifier...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"   Train set: {X_train.shape[0]} samples")
        print(f"   Test set: {X_test.shape[0]} samples")
        
        # Class weights for handling imbalance (emphasize High Distress)
        class_counts = np.bincount(y_train)
        class_weights = {}
        if optimize_for_recall:
            # Give more weight to High Distress class (class 2)
            class_weights = {
                0: 1.0,  # Low
                1: 1.5,  # Medium
                2: 3.0   # High - we cannot miss these!
            }
            print(f"   Using class weights: {class_weights}")
        
        # Initialize CatBoost
        self.model = CatBoostClassifier(
            iterations=500,
            learning_rate=0.05,
            depth=8,
            l2_leaf_reg=3,
            class_weights=class_weights,
            cat_features=self.categorical_features,
            random_seed=42,
            verbose=False,
            eval_metric='TotalF1',
            early_stopping_rounds=50
        )
        
        # Create Pool objects for CatBoost
        train_pool = Pool(X_train, y_train, cat_features=self.categorical_features)
        test_pool = Pool(X_test, y_test, cat_features=self.categorical_features)
        
        # Train with validation
        print("   Training in progress...")
        self.model.fit(
            train_pool,
            eval_set=test_pool,
            verbose=100
        )
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)
        
        print("\n📊 Model Performance:")
        print(f"\n   Accuracy: {accuracy_score(y_test, y_pred):.4f}")
        
        # Classification report
        target_names = ['Low Risk', 'Medium Risk', 'High Risk']
        print(f"\n   Classification Report:")
        print(classification_report(y_test, y_pred, target_names=target_names))
        
        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        print(f"\n   Confusion Matrix:")
        print(f"   {cm}")
        
        # Feature importance
        self.feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': self.model.get_feature_importance()
        }).sort_values('importance', ascending=False)
        
        print(f"\n   Top 10 Important Features:")
        for idx, row in self.feature_importance.head(10).iterrows():
            print(f"   - {row['feature']}: {row['importance']:.2f}")
        
        # Initialize SHAP explainer
        print("\n🔍 Initializing SHAP Explainer...")
        self.explainer = shap.TreeExplainer(self.model)
        
        # Store test data for verification
        self.X_test = X_test
        self.y_test = y_test
        
        return self.model, X_test, y_test
    
    def cross_validate(self, X, y, n_splits=5):
        """Perform stratified k-fold cross-validation."""
        print(f"\n🔄 Performing {n_splits}-Fold Cross-Validation...")
        
        skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
        
        cv_scores = []
        fold = 1
        
        for train_idx, val_idx in skf.split(X, y):
            X_train_fold, X_val_fold = X.iloc[train_idx], X.iloc[val_idx]
            y_train_fold, y_val_fold = y.iloc[train_idx], y.iloc[val_idx]
            
            # Train model
            model_fold = CatBoostClassifier(
                iterations=300,
                learning_rate=0.05,
                depth=8,
                cat_features=self.categorical_features,
                random_seed=42,
                verbose=False
            )
            
            train_pool = Pool(X_train_fold, y_train_fold, cat_features=self.categorical_features)
            model_fold.fit(train_pool)
            
            # Evaluate
            y_pred = model_fold.predict(X_val_fold)
            accuracy = accuracy_score(y_val_fold, y_pred)
            cv_scores.append(accuracy)
            
            print(f"   Fold {fold}: Accuracy = {accuracy:.4f}")
            fold += 1
        
        print(f"\n   Mean CV Accuracy: {np.mean(cv_scores):.4f} (+/- {np.std(cv_scores):.4f})")
        return cv_scores
    
    def get_shap_explanation(self, user_data, return_base64=True):
        """
        Generate SHAP explanation for a single prediction.
        Returns base64 encoded plot for API response.
        """
        if self.explainer is None:
            raise ValueError("Model must be trained before generating SHAP explanations")
        
        # Ensure user_data is a DataFrame
        if isinstance(user_data, dict):
            user_data = pd.DataFrame([user_data])
        
        # Ensure columns match
        user_data = user_data[self.feature_columns]
        
        # Calculate SHAP values
        shap_values = self.explainer.shap_values(user_data)
        
        # For multi-class, get SHAP values for predicted class
        prediction = self.model.predict(user_data)[0]
        
        # Create waterfall plot - fix expected_value indexing
        plt.figure(figsize=(10, 6))
        
        # Get base value for the predicted class
        if isinstance(self.explainer.expected_value, (list, np.ndarray)):
            base_value = self.explainer.expected_value[int(prediction)]
        else:
            base_value = self.explainer.expected_value
            
        shap.waterfall_plot(
            shap.Explanation(
                values=shap_values[int(prediction)][0],
                base_values=base_value,
                data=user_data.iloc[0],
                feature_names=user_data.columns.tolist()
            ),
            show=False
        )
        plt.title(f"Why Risk Level = {['Low', 'Medium', 'High'][prediction]}", 
                 fontsize=14, fontweight='bold')
        plt.tight_layout()
        
        if return_base64:
            # Convert plot to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close()
            return image_base64
        else:
            plt.show()
            return None
    
    def predict(self, user_data):
        """Make prediction with confidence scores."""
        if self.model is None:
            raise ValueError("Model must be trained before prediction")
        
        # Ensure DataFrame
        if isinstance(user_data, dict):
            user_data = pd.DataFrame([user_data])
        
        # Make a copy to avoid modifying original
        user_data = user_data.copy()
        
        # Add missing columns with default values
        missing_cols = set(self.feature_columns) - set(user_data.columns)
        if missing_cols:
            for col in missing_cols:
                if col in self.categorical_features:
                    user_data[col] = 'Unknown'
                else:
                    user_data[col] = 0
        
        # Ensure columns match training data order
        user_data = user_data[self.feature_columns]
        
        # Predict
        prediction = int(self.model.predict(user_data)[0])
        probabilities = self.model.predict_proba(user_data)[0]
        
        # Map to labels
        risk_levels = ['Low', 'Medium', 'High']
        predicted_risk = risk_levels[prediction]
        confidence = probabilities[prediction]
        
        return {
            'prediction': predicted_risk,
            'confidence': float(confidence),
            'probabilities': {
                'Low': float(probabilities[0]),
                'Medium': float(probabilities[1]),
                'High': float(probabilities[2])
            }
        }
    
    def save_model(self):
        """Save trained model and metadata."""
        print("\n💾 Saving Model...")
        
        # Save CatBoost model
        model_path = self.model_dir / 'catboost_model.cbm'
        self.model.save_model(str(model_path))
        print(f"   ✅ Model saved to: {model_path}")
        
        # Save metadata
        metadata = {
            'feature_columns': self.feature_columns,
            'categorical_features': self.categorical_features,
            'feature_importance': self.feature_importance.to_dict('records')
        }
        
        metadata_path = self.model_dir / 'model_metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"   ✅ Metadata saved to: {metadata_path}")
    
    def load_model(self):
        """Load trained model and metadata."""
        print("\n📂 Loading Model...")
        
        model_path = self.model_dir / 'catboost_model.cbm'
        metadata_path = self.model_dir / 'model_metadata.json'
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        # Load model
        self.model = CatBoostClassifier()
        self.model.load_model(str(model_path))
        print(f"   ✅ Model loaded from: {model_path}")
        
        # Load metadata
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        self.feature_columns = metadata['feature_columns']
        self.categorical_features = metadata['categorical_features']
        self.feature_importance = pd.DataFrame(metadata['feature_importance'])
        
        # Initialize SHAP explainer
        self.explainer = shap.TreeExplainer(self.model)
        print(f"   ✅ Metadata and SHAP explainer loaded")

def main():
    """Main training pipeline."""
    print("="*70)
    print("🤖 FINANCIAL DISTRESS PREDICTOR - ML TRAINING PIPELINE")
    print("="*70)
    
    # Load processed data
    print("\n📂 Loading Processed Data...")
    df = pd.read_csv('../data/processed/household_budget_processed.csv')
    print(f"   Loaded {len(df)} samples")
    
    # Initialize predictor
    predictor = FinancialDistressPredictor()
    
    # Prepare data
    X, y = predictor.prepare_data(df)
    
    # Cross-validation
    predictor.cross_validate(X, y, n_splits=5)
    
    # Train final model
    model, X_test, y_test = predictor.train(X, y, optimize_for_recall=True)
    
    # Save model
    predictor.save_model()
    
    # Test SHAP explanation
    print("\n🔍 Testing SHAP Explanation...")
    sample_data = X_test.iloc[0:1]
    shap_plot = predictor.get_shap_explanation(sample_data)
    print(f"   ✅ SHAP plot generated ({len(shap_plot)} characters)")
    
    print("\n" + "="*70)
    print("✅ ML TRAINING COMPLETE!")
    print("="*70)
    
    return predictor

if __name__ == '__main__':
    predictor = main()
