import pandas as pd
import json
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score

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
                "explanation": "Gradient Boosting Regressor requires one target and at least one feature column."
            }

        y = X.iloc[:, 0]
        X = X.iloc[:, 1:]

        model = GradientBoostingRegressor()
        model.fit(X, y)
        preds = model.predict(X)

        # Convert feature importances to standard Python types
        feature_importances = {}
        for i, col in enumerate(X.columns):
            feature_importances[col] = float(model.feature_importances_[i])

        # Convert prediction data to list of float pairs
        pred_actual_pairs = []
        for i in range(len(preds)):
            pred_actual_pairs.append([float(preds[i]), float(y.iloc[i])])

        return {
            "charts": {
                "predicted_vs_actual": pred_actual_pairs
            },
            "stats": {
                "r2": float(r2_score(y, preds)),
                "mse": float(mean_squared_error(y, preds))
            },
            "tables": {
                "feature_importances": feature_importances
            },
            "explanation": "Gradient Boosting Regressor builds models sequentially, minimizing the error of the previous model using decision trees."
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