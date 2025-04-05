import pandas as pd
import json
import numpy as np

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, pd.Timestamp):
            return obj.strftime('%Y-%m-%d')
        return super(NpEncoder, self).default(obj)

def run(df: pd.DataFrame, params: dict = None):
    try:
        # Check if prophet is available
        try:
            from prophet import Prophet
            prophet_available = True
        except ImportError:
            prophet_available = False
            
        if not prophet_available:
            return simulate_forecasting_result(df)
            
        if df.shape[1] < 2:
            return {
                "charts": {},
                "stats": {"error": "Dataset must have at least 2 columns (date/time + numeric target)."},
                "tables": {},
                "explanation": "Prophet requires a datetime column and a numeric target column."
            }

        df = df.rename(columns={df.columns[0]: "ds", df.columns[1]: "y"})
        df = df[["ds", "y"]].dropna()

        if not pd.api.types.is_datetime64_any_dtype(df["ds"]):
            df["ds"] = pd.to_datetime(df["ds"], errors="coerce")
            df = df.dropna()

        model = Prophet()
        model.fit(df)
        future = model.make_future_dataframe(periods=30)
        forecast = model.predict(future)

        # Convert forecast data to serializable format
        forecast_data = []
        for i in range(len(forecast.tail(30))):
            row = forecast.tail(30).iloc[i]
            forecast_data.append({"ds": row["ds"].strftime("%Y-%m-%d"), "yhat": float(row["yhat"])})

        last_forecast = []
        for i in range(len(forecast.tail(10))):
            row = forecast.tail(10).iloc[i]
            forecast_dict = {}
            for col in row.index:
                if isinstance(row[col], (np.integer, np.floating, np.ndarray)):
                    forecast_dict[col] = float(row[col])
                elif isinstance(row[col], pd.Timestamp):
                    forecast_dict[col] = row[col].strftime("%Y-%m-%d")
                else:
                    forecast_dict[col] = row[col]
            last_forecast.append(forecast_dict)

        return {
            "charts": {
                "forecast": forecast_data
            },
            "stats": {
                "total_forecasted_days": 30
            },
            "tables": {
                "last_forecast": last_forecast
            },
            "explanation": "Prophet forecasts time series data using additive models with trend and seasonality components, ideal for business or event-driven series."
        }

    except Exception as e:
        return {
            "charts": {},
            "stats": {"error": f"Model error: {str(e)}"},
            "tables": {},
            "explanation": "An error occurred during time series forecasting."
        }

def simulate_forecasting_result(df):
    """Fallback function when Prophet is not available"""
    try:
        if df.shape[1] < 2:
            return {
                "charts": {},
                "stats": {"error": "Dataset must have at least 2 columns (date/time + numeric target)."},
                "tables": {},
                "explanation": "Time series forecasting requires a datetime column and a numeric target column."
            }
        
        # Create a simple linear trend forecast as fallback
        y_values = df.iloc[:, 1].dropna().tolist()
        if not y_values:
            return {
                "charts": {},
                "stats": {"error": "No valid numeric values in target column"},
                "tables": {},
                "explanation": "Cannot generate forecast without valid numeric data."
            }
        
        # Simulate forecasted data with some noise
        last_value = y_values[-1]
        trend = (y_values[-1] - y_values[0]) / len(y_values) if len(y_values) > 1 else 0
        
        forecasted_dates = pd.date_range(start=pd.Timestamp.now(), periods=30, freq='D')
        forecasted_values = []
        
        for i in range(30):
            next_val = last_value + trend * (i + 1) + np.random.normal(0, abs(trend) * 2 if trend != 0 else 0.1)
            forecasted_values.append(next_val)
            
        forecast_data = [{"ds": date.strftime("%Y-%m-%d"), "yhat": float(val)} 
                         for date, val in zip(forecasted_dates, forecasted_values)]
        
        return {
            "charts": {
                "forecast": forecast_data
            },
            "stats": {
                "total_forecasted_days": 30,
                "note": "Using simplified linear trend forecast (Prophet not available)"
            },
            "tables": {
                "last_forecast": forecast_data[-10:]
            },
            "explanation": "This is a simple trend-based forecast. For more accurate forecasts including seasonality, install Prophet package."
        }
        
    except Exception as e:
        return {
            "charts": {},
            "stats": {"error": f"Fallback model error: {str(e)}"},
            "tables": {},
            "explanation": "An error occurred during time series forecasting."
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
            "explanation": "An error occurred during time series forecasting."
        }))
        sys.exit(1)