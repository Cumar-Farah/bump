import pandas as pd
import json
import sys
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

def run(df: pd.DataFrame, params: dict = None):
    try:
        params = params or {}
        n_components = params.get('n_components', 2)
        
        # Get numeric columns only
        numeric_cols = df.select_dtypes(include='number').columns.tolist()
        
        if len(numeric_cols) < 3:
            return {
                "charts": {},
                "stats": {"error": "At least 3 numeric columns required"},
                "tables": {},
                "explanation": "PCA requires at least 3 numeric features to be useful for dimensionality reduction."
            }
            
        # Prepare data
        X = df[numeric_cols].dropna()
        
        # Scale the data
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Limit n_components to the number of features or 10, whichever is smaller
        n_components = min(n_components, len(numeric_cols), 10)
        
        # Fit PCA
        pca = PCA(n_components=n_components)
        X_pca = pca.fit_transform(X_scaled)
        
        # Component data for visualization
        if n_components >= 2:
            pca_points = [{"pc1": float(row[0]), "pc2": float(row[1]), "index": i} 
                           for i, row in enumerate(X_pca)]
        else:
            pca_points = [{"pc1": float(val), "index": i} for i, val in enumerate(X_pca)]
        
        # Calculate explained variance
        explained_variance = {f"PC{i+1}": float(var) 
                              for i, var in enumerate(pca.explained_variance_ratio_)}
        
        # Calculate component loadings
        loadings = {}
        for i, component in enumerate(pca.components_):
            if i < 5:  # Limit to first 5 components
                loadings[f"PC{i+1}"] = {col: float(val) 
                                       for col, val in zip(numeric_cols, component)}
                
        return {
            "charts": {
                "pca_scatter": pca_points,
                "explained_variance": explained_variance
            },
            "stats": {},
            "tables": {
                "component_loadings": loadings
            },
            "explanation": "Principal Component Analysis (PCA) reduces the dimensionality of data by transforming it into linearly uncorrelated components. Each component is a linear combination of the original features."
        }
        
    except Exception as e:
        return {
            "charts": {},
            "stats": {"error": str(e)},
            "tables": {},
            "explanation": "An error occurred during PCA execution."
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