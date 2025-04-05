import os
import sys
import json
import pandas as pd
from pathlib import Path
import csv
import importlib.util

# Get the current directory and add it to the path
current_dir = Path(__file__).parent
server_dir = current_dir.parent
sys.path.append(str(server_dir))

# Import utilities
try:
    from server.utils.json_utils import NpEncoder, format_error_response
    from server.utils.technique_utils import (
        SUPPORTED_TECHNIQUES, 
        TECHNIQUE_MODULE_MAP,
        is_supported_technique,
        import_technique_module
    )
except ImportError:
    # If we can't find them, add more paths
    project_root = str(server_dir.parent)
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    # Try again
    from server.utils.json_utils import NpEncoder, format_error_response
    from server.utils.technique_utils import (
        SUPPORTED_TECHNIQUES, 
        TECHNIQUE_MODULE_MAP,
        is_supported_technique,
        import_technique_module
    )
    
# Attempt to import from the server module - this is for direct DB access
try:
    # First try importing directly
    storage_spec = importlib.util.find_spec('server.storage')
    if storage_spec:
        from server.storage import storage
        from server.api.upload import sessionData
        USE_DATABASE = True
    else:
        # Fallback to session data only
        from server.api.upload import sessionData
        USE_DATABASE = False
except ImportError:
    # Fallback if we can't import the storage
    from server.api.upload import sessionData
    USE_DATABASE = False

def run_technique(technique, data_id, user_id, params=None):
    """Run a specific technique on dataset"""
    
    # Try to get file path first from session data (backward compatibility)
    file_path = None
    schema_data = None
    
    if sessionData.get(user_id) and 'filePath' in sessionData[user_id]:
        file_path = sessionData[user_id]['filePath']
        schema_data = sessionData[user_id].get('schema')
    
    # If not found in session and database access is available, try from DB
    if (not file_path or not os.path.exists(file_path)) and USE_DATABASE:
        try:
            # Get dataset info from the database
            dataset = storage.getDataset(int(data_id))
            if dataset and dataset.filePath and os.path.exists(dataset.filePath):
                file_path = dataset.filePath
                
                # Try to parse schema data from the database
                if dataset.schemaData:
                    try:
                        schema_data = json.loads(dataset.schemaData)
                    except:
                        schema_data = None
        except Exception as e:
            return {"error": f"Database error: {str(e)}"}
    
    # If still no file path, return error
    if not file_path or not os.path.exists(file_path):
        return {"error": "Dataset file not found"}
    
    # Load the CSV file into a pandas DataFrame
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        return {"error": f"Failed to read dataset file: {str(e)}"}
    
    # Map technique names to modules
    logic_map = {
        "kmeans": "logic.kmeans",
        "isolation_forest": "logic.isolation_forest",
        "linear_regression": "logic.linear_regression",
        "random_forest_classifier": "logic.random_forest_classifier",
        "dbscan": "logic.dbscan",
        "ridge_regression": "logic.ridge_regression",
        "lasso_regression": "logic.lasso_regression",
        "svc": "logic.svc",
        "svr": "logic.svr",
        "hierarchical_clustering": "logic.hierarchical_clustering",
        "gaussian_nb": "logic.gaussian_nb",
        "gradient_boosting_classifier": "logic.gradient_boosting_classifier",
        "gradient_boosting_regressor": "logic.gradient_boosting_regressor",
        "prophet_forecasting": "logic.prophet_forecasting",
        "kernel_pca": "logic.kernel_pca"
    }
    
    if technique not in logic_map:
        return {"error": f"Unsupported technique: {technique}"}
    
    try:
        # Import the requested module dynamically
        module_name = logic_map[technique]
        module_parts = module_name.split('.')
        
        # Handle both Python and JavaScript implementations
        if module_parts[0] == 'logic':
            # Try Python module first
            try:
                python_module = __import__(f"server.{module_name}", fromlist=['run'])
                result = python_module.run(df, params)
                return result
            except (ImportError, AttributeError) as e:
                # Fall back to JavaScript implementation
                js_path = os.path.join(server_dir, f"{module_parts[0]}/{module_parts[1]}.js")
                if os.path.exists(js_path):
                    # Here we'd typically call the JS module, but for simplicity
                    # we'll return an error message
                    return {"error": f"Python module failed: {str(e)}. JS module not implemented."}
                else:
                    return {"error": f"Module not found: {module_name}"}
        
        return {"error": "Invalid module path"}
        
    except Exception as e:
        return {"error": f"Error running technique: {str(e)}"}