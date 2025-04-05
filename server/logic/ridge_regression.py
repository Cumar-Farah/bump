        import pandas as pd
        import json
        import sys
        from sklearn.linear_model import Ridge
        from sklearn.metrics import r2_score, mean_squared_error

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
                        "explanation": "Ridge Regression requires one target and at least one feature column."
                    }

                y = df[target_column] if target_column in df.columns else df[numeric_cols[0]]
                X = df[numeric_cols].drop(columns=[y.name])

                model = Ridge(alpha=params.get("alpha", 1.0))
                model.fit(X, y)
                preds = model.predict(X)

                return {
                    "charts": {
                        "predicted_vs_actual": list(zip(preds.tolist(), y.tolist()))
                    },
                    "stats": {
                        "r2": round(r2_score(y, preds), 4),
                        "mse": round(mean_squared_error(y, preds), 4)
                    },
                    "tables": {
                        "coefficients": dict(zip(X.columns, model.coef_.tolist()))
                    },
                    "explanation": "Ridge Regression adds L2 regularization to penalize large coefficients and reduce overfitting."
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
