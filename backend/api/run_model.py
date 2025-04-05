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

# Import utilities
try:
    from backend.utils.json_utils import NpEncoder, format_error_response
    from backend.utils.technique_utils import (
        SUPPORTED_TECHNIQUES, 
        import_technique_module,
        is_supported_technique
    )
except ImportError:
    # Add the project root to sys.path to find the utils package
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    # Try import again
    from backend.utils.json_utils import NpEncoder, format_error_response
    from backend.utils.technique_utils import (
        SUPPORTED_TECHNIQUES, 
        import_technique_module,
        is_supported_technique
    )

def run_technique(technique, data_path, params=None):
    """Run a specific technique on dataset"""
    
    # Validate the technique is supported
    if not is_supported_technique(technique):
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
        
        # Import the module for the specified technique using our utility function
        module, error = import_technique_module(technique)
        
        if error:
            return error
        
        # Call the run function from the module
        result = module.run(data, params)
        return result
    
    except Exception as e:
        return format_error_response(f"Error running {technique}: {str(e)}", technique)

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