import pandas as pd
import json
import sys
from sklearn.ensemble import IsolationForest

def run(df: pd.DataFrame, params: dict = None):
    try:
        params = params or {}
        numeric_cols = df.select_dtypes(include='number').columns.tolist()

        if len(numeric_cols) < 1:
            return {
                "charts": {},
                "stats": {"error": "At least 1 numeric column required"},
                "tables": {},
                "explanation": "Isolation Forest requires numeric input to identify outliers."
            }

        X = df[numeric_cols].dropna()
        model = IsolationForest(contamination=params.get("contamination", 0.1), random_state=42)
        model.fit(X)

        scores = model.decision_function(X)
        labels = model.predict(X)  # -1 = anomaly, 1 = normal

        return {
            "charts": {
                "anomaly_scores": scores.tolist()
            },
            "stats": {
                "n_outliers": int((labels == -1).sum()),
                "n_samples": len(labels)
            },
            "tables": {
                "outliers": [{"Index": i, "Anomaly": int(label)} for i, label in enumerate(labels)]
            },
            "explanation": "Isolation Forest isolates anomalies instead of profiling normal data. It is effective for unsupervised anomaly detection."
        }

    except Exception as e:
        return {
            "charts": {},
            "stats": {"error": str(e)},
            "tables": {},
            "explanation": "An error occurred during anomaly detection."
        }

if __name__ == "__main__":
    try:
        file_path = sys.argv[1]
        df = pd.read_csv(file_path)
        result = run(df)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
