import pandas as pd
import json
import numpy as np
from sklearn.decomposition import KernelPCA

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
                "stats": {"error": "At least 2 numeric features required"},
                "tables": {},
                "explanation": "Kernel PCA requires multiple numeric features to compute non-linear projections."
            }

        kernel = params.get("kernel", "rbf") if params else "rbf"
        kpca = KernelPCA(n_components=2, kernel=kernel)
        X_kpca = kpca.fit_transform(X)

        return {
            "charts": {
                "projection_2D": X_kpca.tolist()
            },
            "stats": {},
            "tables": {},
            "explanation": f"Kernel PCA reduces dimensionality using a {kernel.upper()} kernel, capturing non-linear feature interactions."
        }

    except Exception as e:
        return {
            "charts": {},
            "stats": {"error": f"Model error: {str(e)}"},
            "tables": {},
            "explanation": "An error occurred during Kernel PCA dimensionality reduction."
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