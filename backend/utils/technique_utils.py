"""
Shared utilities for managing ML techniques and their import paths.
"""

import os
import sys
import importlib
from .json_utils import format_error_response

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

def is_supported_technique(technique):
    """Check if a technique is in the supported list"""
    return technique in SUPPORTED_TECHNIQUES

def get_technique_paths():
    """Get all possible technique file locations for the current project structure"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))  # Go up two levels
    backend_dir = os.path.join(project_root, 'backend')
    server_dir = os.path.join(project_root, 'server')
    
    return {
        "project_root": project_root,
        "backend_dir": backend_dir,
        "server_dir": server_dir,
        "backend_logic": os.path.join(backend_dir, "logic"),
        "server_logic": os.path.join(server_dir, "logic")
    }

def add_paths_to_sys_path():
    """Add relevant paths to Python sys.path"""
    paths = get_technique_paths()
    for directory in [paths["backend_dir"], paths["server_dir"], paths["project_root"]]:
        if directory not in sys.path:
            sys.path.insert(0, directory)

def import_technique_module(technique):
    """Import a technique module dynamically using a consistent approach"""
    if not is_supported_technique(technique):
        return None, format_error_response(f"Technique '{technique}' is not supported")
    
    add_paths_to_sys_path()
    paths = get_technique_paths()
    
    # Try different possible module paths
    module = None
    
    # First approach: direct imports from different paths
    module_paths = [
        f"backend.logic.{technique}",  # If imported from project root
        f"logic.{technique}",          # If imported from backend folder
        f"server.logic.{technique}"    # If imported from project root
    ]
    
    for path in module_paths:
        try:
            module = importlib.import_module(path)
            print(f"Successfully imported module from {path}")
            return module, None
        except ImportError as e:
            print(f"Import failed for {path}: {str(e)}")
            continue
    
    # Second approach: direct file import
    if not module:
        for directory in ["backend/logic", "server/logic"]:
            module_path = os.path.join(paths["project_root"], directory, f"{technique}.py")
            if os.path.exists(module_path):
                print(f"Found module file at {module_path}")
                # Add directory to path
                module_dir = os.path.join(paths["project_root"], directory)
                if module_dir not in sys.path:
                    sys.path.insert(0, module_dir)
                # Try importing
                try:
                    module = importlib.import_module(technique)
                    print(f"Successfully imported from file {module_path}")
                    return module, None
                except ImportError as e:
                    print(f"Import failed for {module_path}: {str(e)}")
    
    # If no module was found
    return None, format_error_response(
        f"Could not find module for technique: {technique}",
        technique
    )