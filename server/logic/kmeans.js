// KMeans implementation using simple-kmeans package
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// We'll use Python's scikit-learn for KMeans since it's more robust
function runKMeans(data, params = {}) {
  return new Promise((resolve, reject) => {
    // Default parameters
    const nClusters = params.nClusters || 3;
    
    // Create a temporary file to store the data
    const tempFile = path.join(__dirname, '../../temp_data.json');
    
    // Ensure we only use numeric data for clustering
    const numericData = data.map(row => {
      const numericRow = {};
      Object.keys(row).forEach(key => {
        if (typeof row[key] === 'number' && !isNaN(row[key])) {
          numericRow[key] = row[key];
        }
      });
      return numericRow;
    });
    
    // Write the data to a temporary file
    fs.writeFileSync(tempFile, JSON.stringify(numericData));
    
    // Path to Python script
    const pythonScript = path.join(__dirname, 'kmeans.py');
    
    // Create the Python script if it doesn't exist
    if (!fs.existsSync(pythonScript)) {
      const pythonCode = `
import sys
import json
import numpy as np
from sklearn.cluster import KMeans

# Load the data from the temporary file
with open(sys.argv[1], 'r') as f:
    data = json.load(f)

# Extract features (assuming all values are numeric)
features = []
for row in data:
    # Get all numeric values
    row_values = list(row.values())
    if row_values:  # Make sure we have values
        features.append(row_values)

# Convert to numpy array
X = np.array(features)

# Fit KMeans
n_clusters = int(sys.argv[2])
kmeans = KMeans(n_clusters=n_clusters, random_state=42)
kmeans.fit(X)

# Prepare results
result = {
    "charts": {
        "centroids": kmeans.cluster_centers_.tolist()
    },
    "stats": {
        "inertia": float(kmeans.inertia_),
        "n_iter": int(kmeans.n_iter_)
    },
    "tables": {
        "labels": kmeans.labels_.tolist()
    },
    "explanation": "KMeans clustered your data based on numeric features using Euclidean distance."
}

# Output as JSON
print(json.dumps(result))
      `;
      fs.writeFileSync(pythonScript, pythonCode);
    }
    
    // Run the Python script
    const pythonProcess = spawn('python', [pythonScript, tempFile, nClusters.toString()]);
    
    let resultData = '';
    let errorData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      // Clean up the temporary file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      
      if (code !== 0) {
        console.error('Python process error:', errorData);
        reject(new Error(`Python process exited with code ${code}: ${errorData}`));
        return;
      }
      
      try {
        const result = JSON.parse(resultData);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse KMeans result: ${error.message}`));
      }
    });
  });
}

module.exports = {
  run: runKMeans
};