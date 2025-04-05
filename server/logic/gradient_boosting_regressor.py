        import pandas as pd
        import json
        import sys
        from sklearn.ensemble import GradientBoostingRegressor
        from sklearn.metrics import mean_squared_error, r2_score

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
                        "explanation": "Gradient Boosting Regressor needs one target and at least one numeric feature column."
                    }

                y = df[target_column] if target_column in df.columns else df[numeric_cols[0]]
                X = df[numeric_cols].drop(columns=[y.name])

                model = GradientBoostingRegressor()
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
                        "feature_importances": dict(zip(X.columns, model.feature_importances_.tolist()))
                    },
                    "explanation": "Gradient Boosting Regressor fits trees sequentially to correct previous errors, ideal for capturing complex patterns in numeric targets."
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
