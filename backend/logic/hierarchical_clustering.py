import pandas as pd
import json
import numpy as np
from scipy.cluster.hierarchy import linkage, fcluster
from scipy.spatial.distance import pdist

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
                "stats": {"error": "At least 2 numeric columns required"},
                "tables": {},
                "explanation": "Hierarchical Clustering requires at least two numeric features."
            }

        method = params.get("method", "ward") if params else "ward"
        Z = linkage(X, method=method)
        clusters = fcluster(Z, t=3, criterion='maxclust')

        # Convert cluster assignments to a list of dictionaries
        cluster_assignments = []
        for i, c in enumerate(clusters):
            cluster_assignments.append({"Index": int(i), "Cluster": int(c)})

        return {
            "charts": {
                "linkage_matrix": Z.tolist()
            },
            "stats": {
                "n_clusters": int(len(set(clusters)))
            },
            "tables": {
                "cluster_assignments": cluster_assignments
            },
            "explanation": "Hierarchical Clustering builds nested clusters by merging or splitting them successively using a chosen linkage method."
        }

    except Exception as e:
        return {
            "charts": {},
            "stats": {"error": f"Model error: {str(e)}"},
            "tables": {},
            "explanation": "An error occurred during model execution."
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