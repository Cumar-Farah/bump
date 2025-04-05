"""
Shared utilities for JSON encoding and processing.
"""

import json
import numpy as np
import pandas as pd

class NpEncoder(json.JSONEncoder):
    """Custom JSON encoder for NumPy types"""
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, pd.Timestamp):
            return obj.strftime('%Y-%m-%d')
        return super(NpEncoder, self).default(obj)

def format_error_response(error_message, technique=None):
    """Create a standardized error response format"""
    return {
        "charts": {},
        "stats": {"error": error_message},
        "tables": {},
        "explanation": f"An error occurred{' during ' + technique if technique else ''}."
    }