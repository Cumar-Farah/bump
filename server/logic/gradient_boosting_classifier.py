        import pandas as pd
        import json
        import sys
        from sklearn.ensemble import GradientBoostingClassifier
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import accuracy_score, classification_report

        def run(df: pd.DataFrame, params: dict = None):
            try:
                params = params or {}
                target_column = params.get('target_column')

                numeric_cols = df.select_dtypes(include='number').columns.tolist()
                if len(numeric_cols) < 2:
                    return {
                        "charts": {},
                        "stats": {"error": "At least 2 numeric columns required"},
                        "tables": {},
                        "explanation": "Gradient Boosting Classifier requires one target and at least one numeric feature column."
                    }

                y = df[target_column] if target_column in df.columns else df[numeric_cols[0]]
                X = df[numeric_cols].drop(columns=[y.name])

                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
                model = GradientBoostingClassifier()
                model.fit(X_train, y_train)
                preds = model.predict(X_test)

                return {
                    "charts": {
                        "feature_importances": dict(zip(X.columns, model.feature_importances_.tolist()))
                    },
                    "stats": {
                        "accuracy": round(accuracy_score(y_test, preds), 4)
                    },
                    "tables": {
                        "classification_report": classification_report(y_test, preds, output_dict=True)
                    },
                    "explanation": "Gradient Boosting Classifier builds an ensemble of shallow decision trees, each correcting the last. It's powerful and widely used in structured data competitions."
                }

            except Exception as e:
                return {
                    "charts": {},
                    "stats": {"error": str(e)},
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
