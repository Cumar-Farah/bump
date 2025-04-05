import pandas as pd
import json
import sys
from sklearn.cluster import DBSCAN

def run(df: pd.DataFrame, params: dict = None):
    try:
        params = params or {}
        numeric_cols = df.select_dtypes(include='number').columns.tolist()

        if len(numeric_cols) < 2:
            return {
                "charts": {},
                "stats": {"error": "At least 2 numeric columns required"},
                "tables": {},
                "explanation": "DBSCAN requires at least two numeric features to form clusters."
            }

        X = df[numeric_cols].dropna()

        model = DBSCAN(
            eps=params.get("eps", 0.5),
            min_samples=params.get("min_samples", 5)
        )
        labels = model.fit_predict(X)

        return {
            "charts": {
                "cluster_labels": labels.tolist()
            },
            "stats": {
                "n_clusters": len(set(labels)) - (1 if -1 in labels else 0),
                "n_noise": list(labels).count(-1)
            },
            "tables": {
                "cluster_assignments": [{"Index": i, "Cluster": int(label)} for i, label in enumerate(labels)]
            },
            "explanation": "DBSCAN clusters data based on density. It identifies core samples and expands clusters from them, treating outliers as noise."
        }

    except Exception as e:
        return {
            "charts": {},
            "stats": {"error": str(e)},
            "tables": {},
            "explanation": "An error occurred during clustering execution."
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
