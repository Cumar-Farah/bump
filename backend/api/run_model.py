"""
This is the main entry point for running machine learning models.
It loads the appropriate model module based on the specified technique
and runs it on the dataset.
"""

import sys
import os
import json
import importlib
import pandas as pd

# Define the list of supported techniques
SUPPORTED_TECHNIQUES = [
    'kmeans',
    'isolation_forest',
    'linear_regression',
    'random_forest_classifier',
    'dbscan',
    'ridge_regression',
    'lasso_regression',
    'svc',
    'svr',
    'hierarchical_clustering',
    'gaussian_nb',
    'gradient_boosting_classifier',
    'gradient_boosting_regressor',
    'prophet_forecasting',
    'kernel_pca'
]

class NpEncoder(json.JSONEncoder):
    """Custom JSON encoder for NumPy types"""
    def default(self, obj):
        import numpy as np
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, pd.Timestamp):
            return obj.strftime('%Y-%m-%d')
        return super(NpEncoder, self).default(obj)

def run_technique(technique, data_path, params=None):
    """Run a specific technique on dataset"""
    
    # Validate the technique is supported
    if technique not in SUPPORTED_TECHNIQUES:
        return {
            "error": f"Technique '{technique}' is not supported",
            "supported_techniques": SUPPORTED_TECHNIQUES
        }
    
    try:
        # Load the dataset
        data = pd.read_json(data_path)
        
        # Handle target column if specified in params
        if params and 'target_column' in params:
            # Set target column aside
            target_column = params['target_column']
            if target_column in data.columns:
                # Add metadata about target column to params so models can use it
                params['target_data'] = data[target_column]
                print(f"Using column '{target_column}' as target variable")
            else:
                print(f"Warning: Target column '{target_column}' not found in dataset")
        
        # Import the module for the specified technique
        # Get the directory structure to correctly find the module
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(current_dir))  # Go up two levels
        backend_dir = os.path.join(project_root, 'backend')
        server_dir = os.path.join(project_root, 'server')
        
        # Add these directories to the Python path
        for directory in [backend_dir, server_dir, project_root]:
            if directory not in sys.path:
                sys.path.insert(0, directory)
        
        # Try different possible module paths
        module = None
        for path in [
            f"backend.logic.{technique}",  # If imported from project root
            f"logic.{technique}",          # If imported from backend folder
            f"server.logic.{technique}"    # If imported from project root
        ]:
            try:
                module = importlib.import_module(path)
                print(f"Successfully imported module from {path}")
                break
            except ImportError as e:
                print(f"Import failed for {path}: {str(e)}")
                continue
        
        # If we still don't have a module, try direct file import
        if not module:
            # Check for the actual file in the directories
            for directory in ["backend/logic", "server/logic"]:
                module_path = os.path.join(project_root, directory, f"{technique}.py")
                if os.path.exists(module_path):
                    print(f"Found module file at {module_path}")
                    # Add directory to path
                    module_dir = os.path.join(project_root, directory)
                    if module_dir not in sys.path:
                        sys.path.insert(0, module_dir)
                    # Try importing
                    try:
                        module = importlib.import_module(technique)
                        print(f"Successfully imported from file {module_path}")
                        break
                    except ImportError as e:
                        print(f"Import failed for {module_path}: {str(e)}")
        
        if not module:
            # Return a friendly error response instead of raising an exception
            return {
                "charts": {},
                "stats": {"error": f"Could not find module for technique: {technique}"},
                "tables": {},
                "explanation": f"The algorithm module '{technique}' could not be found in the system."
            }
        
        # Call the run function from the module
        result = module.run(data, params)
        return result
    
    except Exception as e:
        return {
            "charts": {},
            "stats": {"error": f"Error running {technique}: {str(e)}"},
            "tables": {},
            "explanation": f"An error occurred during execution of {technique}."
        }

if __name__ == "__main__":
    # Process command line arguments
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python run_model.py [technique] [data_file] [param1=value1] [param2=value2] ..."}))
        sys.exit(1)
    
    technique = sys.argv[1]
    data_path = sys.argv[2]
    
    # Parse optional parameters
    params = {}
    for i in range(3, len(sys.argv)):
        if '=' in sys.argv[i]:
            key, value = sys.argv[i].split('=', 1)
            # Try to convert value to number if possible
            try:
                params[key] = float(value) if '.' in value else int(value)
            except ValueError:
                params[key] = value
    
    # Run the technique and print the result as JSON
    result = run_technique(technique, data_path, params)
    print(json.dumps(result, cls=NpEncoder))