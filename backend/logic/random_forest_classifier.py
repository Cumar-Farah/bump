import pandas as pd
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

def run(df: pd.DataFrame, params: dict = None):
    try:
        X = df.select_dtypes(include='number').dropna()
        if X.shape[1] < 2:
            return {
                "charts": {},
                "stats": {"error": "At least 2 numeric columns required"},
                "tables": {},
                "explanation": "Random Forest needs one target and at least one feature column."
            }

        y = X.iloc[:, 0]
        X = X.iloc[:, 1:]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
        model = RandomForestClassifier()
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)

        # Convert feature importances to a standard Python list
        feature_importances = {}
        for i, col in enumerate(X.columns):
            feature_importances[col] = float(model.feature_importances_[i])

        # Get the classification report as a dictionary and ensure all values are JSON serializable
        report = classification_report(y_test, predictions, output_dict=True)
        # Convert any NumPy types to Python native types
        for class_name in report:
            if isinstance(report[class_name], dict):
                for metric in report[class_name]:
                    report[class_name][metric] = float(report[class_name][metric])

        return {
            "charts": {
                "feature_importances": feature_importances
            },
            "stats": {
                "accuracy": float(accuracy_score(y_test, predictions))
            },
            "tables": {
                "classification_report": report
            },
            "explanation": "Random Forest is an ensemble of decision trees that improves accuracy and reduces overfitting."
        }

    except Exception as e:
        return {
            "charts": {},
            "stats": {"error": f"Model error: {str(e)}"},
            "tables": {},
            "explanation": "An error occurred during model execution."
        }

# This allows the file to be run as a script
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No data file provided"}))
        sys.exit(1)
        
    try:
        # Read data from the file provided as command line argument
        data_file = sys.argv[1]
        df = pd.read_json(data_file)
        
        # Run the algorithm
        result = run(df)
        
        # Convert the result to JSON and print to stdout
        print(json.dumps(result, cls=NpEncoder))
        
    except Exception as e:
        print(json.dumps({
            "charts": {},
            "stats": {"error": f"Execution error: {str(e)}"},
            "tables": {},
            "explanation": "An error occurred during model execution."
        }))
        sys.exit(1)