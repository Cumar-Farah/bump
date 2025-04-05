import pandas as pd
from scipy.cluster.hierarchy import linkage, fcluster
from scipy.spatial.distance import pdist

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

        return {
            "charts": {
                "linkage_matrix": Z.tolist()
            },
            "stats": {
                "n_clusters": len(set(clusters))
            },
            "tables": {
                "cluster_assignments": [{"Index": i, "Cluster": int(c)} for i, c in enumerate(clusters)]
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