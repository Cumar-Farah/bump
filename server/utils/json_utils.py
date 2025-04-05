"""
Shared utilities for JSON encoding and processing.
"""

import json
import numpy as np

class NpEncoder(json.JSONEncoder):
    """Custom JSON encoder for NumPy types"""
    def default(self, o):
        if isinstance(o, np.integer):
            return int(o)
        if isinstance(o, np.floating):
            return float(o)
        if isinstance(o, np.ndarray):
            return o.tolist()
        if isinstance(o, np.bool_):
            return bool(o)
        return super(NpEncoder, self).default(o)

def format_error_response(error_message, technique=None):
    """Create a standardized error response format"""
    return {
        "charts": {},
        "stats": {"error": error_message},
        "tables": {},
        "explanation": f"An error occurred{' during ' + technique if technique else ''}."
    }