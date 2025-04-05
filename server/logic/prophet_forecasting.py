import pandas as pd
import json
import sys
from prophet import Prophet

def run(df: pd.DataFrame, params: dict = None):
    try:
        params = params or {}
        date_col = params.get("date_column", "ds")
        value_col = params.get("target_column", "y")

        # Rename first two columns to ds and y if not explicitly passed
        if date_col not in df.columns or value_col not in df.columns:
            df = df.copy()
            df.columns = ["ds", "y"] + list(df.columns[2:])
        else:
            df = df[[date_col, value_col]].copy()
            df.columns = ["ds", "y"]

        df["ds"] = pd.to_datetime(df["ds"], errors="coerce")
        df = df.dropna()

        if df.empty:
            return {
                "charts": {},
                "stats": {"error": "Dataset must contain valid datetime and numeric values."},
                "tables": {},
                "explanation": "Prophet requires a datetime column (ds) and a numeric target (y)."
            }

        model = Prophet()
        model.fit(df)

        future = model.make_future_dataframe(periods=params.get("periods", 30))
        forecast = model.predict(future)

        return {
            "charts": {
                "forecast": forecast[["ds", "yhat"]].tail(30).to_dict(orient="records")
            },
            "stats": {
                "forecasted_days": 30
            },
            "tables": {
                "forecast_tail": forecast.tail(10).to_dict(orient="records")
            },
            "explanation": "Prophet is a robust time series forecasting model that accounts for trend, seasonality, and holiday effects."
        }

    except Exception as e:
        return {
            "charts": {},
            "stats": {"error": str(e)},
            "tables": {},
            "explanation": "An error occurred during time series forecasting."
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
