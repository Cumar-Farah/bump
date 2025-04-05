import pandas as pd
import json
import sys
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder


def run(df: pd.DataFrame, params: dict = None):
    try:
        params = params or {}
        target_column = params.get('target_column')

        # Get numeric columns only
        numeric_cols = df.select_dtypes(include='number').columns.tolist()

        siajfodishf
        if len(numeric_cols) < 2:
            return {
                "charts": {},
                "stats": {
                    "error": "At least 2 numeric columns required"
                },
                "tables": {},
                "explanation":
                "Decision Tree Classifier needs one target and at least one feature column."
            }

        # Handle target column selection
        y = df[
            target_column] if target_column and target_column in df.columns else df[
                numeric_cols[0]]
        X = df[numeric_cols].drop(columns=[y.name])

        # Encode target if needed
        encoder = None
        if not np.issubdtype(y.dtype, np.number):
            encoder = LabelEncoder()
            y = encoder.fit_transform(y)

        model = DecisionTreeClassifier(random_state=42)
        model.fit(X, y)
        y_pred = model.predict(X)

        # Generate feature importance
        feature_importance = dict(zip(X.columns, model.feature_importances_))
        top_features = dict(
            sorted(feature_importance.items(),
                   key=lambda x: x[1],
                   reverse=True)[:5])

        return {
            "charts": {
                "feature_importances": feature_importance
            },
            "stats": {
                "accuracy": round(accuracy_score(y, y_pred), 4),
                "max_depth": model.get_depth(),
                "n_leaves": model.get_n_leaves()
            },
            "tables": {},
            "explanation":
            "Decision Tree Classifier creates a model that predicts the value of a target variable by learning simple decision rules inferred from the data features."
        }

    except Exception as e:
        return {
            "charts": {},
            "stats": {
                "error": str(e)
            },
            "tables": {},
            "explanation": "An error occurred during model execution."
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
