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

# Create a mapping from technique names to module paths
TECHNIQUE_MODULE_MAP = {
    technique: f"logic.{technique}" for technique in SUPPORTED_TECHNIQUES
}

def is_supported_technique(technique):
    """Check if a technique is in the supported list"""
    return technique in SUPPORTED_TECHNIQUES

def get_technique_paths():
    """Get all possible technique file locations for the current project structure"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    server_dir = os.path.dirname(current_dir)  # One level up to get server dir
    project_root = os.path.dirname(server_dir)  # Another level up for project root
    backend_dir = os.path.join(project_root, 'backend')
    
    return {
        "project_root": project_root,
        "backend_dir": backend_dir,
        "server_dir": server_dir,
        "backend_logic": os.path.join(backend_dir, "logic"),
        "server_logic": os.path.join(server_dir, "logic")
    }

def find_technique_script(technique):
    """Locate the Python script file for a given technique"""
    if not is_supported_technique(technique):
        return None
    
    paths = get_technique_paths()
    
    # Check for technique implementation in both backend and server directories
    possible_paths = [
        os.path.join(paths["server_dir"], "logic", f"{technique}.py"),
        os.path.join(paths["backend_dir"], "logic", f"{technique}.py")
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    return None

def find_run_model_script():
    """Locate the run_model.py script in either backend or server directory"""
    paths = get_technique_paths()
    
    possible_paths = [
        os.path.join(paths["backend_dir"], "api", "run_model.py"),
        os.path.join(paths["server_dir"], "api", "run_model.py")
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    return None

def import_technique_module(technique):
    """Import a technique module from server logic directory"""
    if not is_supported_technique(technique):
        return None, format_error_response(f"Unsupported technique: {technique}")
    
    # Try to import directly from server logic
    try:
        module = __import__(f"server.{TECHNIQUE_MODULE_MAP[technique]}", fromlist=['run'])
        return module, None
    except (ImportError, AttributeError) as e:
        error_message = f"Failed to import module for {technique}: {str(e)}"
        return None, format_error_response(error_message, technique)