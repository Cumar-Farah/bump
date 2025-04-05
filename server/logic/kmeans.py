#!/usr/bin/env python3
import sys
import json
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

def run(df, params=None):
    """
    Run KMeans clustering on the given DataFrame
    
    Args:
        df: pandas DataFrame or list of dictionaries
        params: dictionary of parameters (optional)
    
    Returns:
        Dictionary with clustering results
    """
    # Set default parameters
    if params is None:
        params = {}
    
    n_clusters = params.get('n_clusters', 3)
    
    # Convert input to DataFrame if it's not already
    if not isinstance(df, pd.DataFrame):
        if isinstance(df, list):
            df = pd.DataFrame(df)
        else:
            return {"error": "Input data must be a DataFrame or list of dictionaries"}
    
    # Get only numeric columns
    X = df.select_dtypes(include='number')
    
    if X.empty:
        return {"error": "No numeric data available for clustering"}
    
    # Extract features
    features = X.values
    
    # Run KMeans
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    labels = kmeans.fit_predict(features)
    
    # Calculate silhouette score
    silhouette = 0
    if n_clusters > 1 and n_clusters < len(features):
        try:
            silhouette = silhouette_score(features, labels)
        except:
            silhouette = 0
    
    # Convert data for result
    data_list = X.to_dict('records')
    
    # Format results
    result = {
        "data": data_list,
        "labels": labels.tolist(),
        "centroids": kmeans.cluster_centers_.tolist(),
        "stats": {
            "inertia": float(kmeans.inertia_),
            "silhouette_score": float(silhouette),
            "iterations": int(kmeans.n_iter_)
        },
        "explanation": f"KMeans clustering with {n_clusters} clusters applied to {len(data_list)} data points with {X.shape[1]} features."
    }
    
    return result

def run_kmeans(data, n_clusters=3):
    """Legacy function for backward compatibility"""
    df = pd.DataFrame(data)
    return run(df, {'n_clusters': n_clusters})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python kmeans.py <data_file> [n_clusters]"}))
        sys.exit(1)
    
    try:
        # Read data file
        with open(sys.argv[1], 'r') as f:
            data = json.load(f)
        
        # Get number of clusters
        n_clusters = 3
        if len(sys.argv) > 2:
            n_clusters = int(sys.argv[2])
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Run KMeans
        result = run(df, {'n_clusters': n_clusters})
        
        # Print result as JSON
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)