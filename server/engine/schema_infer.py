import pandas as pd

def infer_schema(df: pd.DataFrame):
    return {
        "columns": list(df.columns),
        "types": df.dtypes.astype(str).to_dict(),
        "missing_percent": df.isnull().mean().round(2).to_dict(),
        "num_features": len(df.select_dtypes(include='number').columns),
        "has_time_column": any("date" in col.lower() or "time" in col.lower() for col in df.columns)
    }