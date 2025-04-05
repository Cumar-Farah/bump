import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import { insertDatasetSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import os from "os";
import { spawn } from "child_process";
import { Request, Response, NextFunction } from "express";
import { sessionData } from "./api/upload";
import csvParser from "csv-parser";

declare global {
  namespace Express {
    interface Request {
      file?: any;
      isGuest?: () => boolean;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Configure multer for file uploads
  const upload = multer({
    dest: path.join(os.tmpdir(), 'bumpdata-uploads'),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max file size
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res, next) => {
    try {
      if (!req.isAuthenticated() && !req.isGuest?.()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const { originalname: filename, size: filesize, path: filepath } = req.file;
      
      // Generate a guest user ID if this is a guest session
      const userId = req.isAuthenticated() 
        ? (req.user as Express.User).id 
        : -1; // Use -1 as a placeholder for guest user ID
      
      // Create permanent file storage
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename and move to permanent location
      const permanentFilename = `${Date.now()}-${filename}`;
      const permanentFilePath = path.join(uploadsDir, permanentFilename);
      fs.copyFileSync(filepath, permanentFilePath);
      
      // Parse the CSV file to get rows and columns (using csvParser)
      const results: any[] = [];
      const headers: string[] = [];
      let rowCount = 0;
      
      try {
        await new Promise<void>((resolve, reject) => {
          fs.createReadStream(filepath)
            .pipe(csvParser())
            .on('headers', (headerList: string[]) => {
              headers.push(...headerList);
            })
            .on('data', () => {
              rowCount++;
            })
            .on('end', () => {
              resolve();
            })
            .on('error', (err: Error) => reject(err));
        });
      } catch (err) {
        console.error("Error parsing CSV:", err);
      }
      
      // Update with actual rows and columns
      const rows = rowCount;
      const columns = headers.length;
      
      // Generate simple schema data
      const schemaData: Record<string, any> = {};
      headers.forEach(header => {
        schemaData[header] = {
          type: 'unknown',
          null_percentage: 0,
          distinct_values: 0
        };
      });
      
      // Validate dataset data
      const datasetData = insertDatasetSchema.parse({
        userId,
        filename,
        filesize,
        filePath: permanentFilePath,
        schemaData: JSON.stringify(schemaData),
        rows,
        columns
      });
      
      // Save dataset info to storage
      const dataset = await storage.createDataset(datasetData);
      
      // Also save to session data for backward compatibility
      if (!sessionData[userId]) {
        sessionData[userId] = {};
      }
      sessionData[userId].filePath = permanentFilePath;
      sessionData[userId].schema = schemaData;
      
      // Cleanup temp file
      fs.unlink(filepath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
      
      res.status(201).json({ ...dataset, schema: schemaData });
    } catch (error) {
      next(error);
    }
  });
  
  // Get user's datasets
  app.get("/api/datasets", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() && !req.isGuest?.()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.isAuthenticated() 
        ? (req.user as Express.User).id 
        : -1; // Use -1 as a placeholder for guest user ID
      
      const datasets = await storage.getDatasetsByUserId(userId);
      
      res.json(datasets);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete a dataset
  app.delete("/api/datasets/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() && !req.isGuest?.()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const datasetId = parseInt(req.params.id);
      const dataset = await storage.getDataset(datasetId);
      
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      // Get the user ID (actual user or guest)
      const userId = req.isAuthenticated() 
        ? (req.user as Express.User).id 
        : -1;
        
      // Check if the dataset belongs to the user or guest
      if (dataset.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this dataset" });
      }
      
      await storage.deleteDataset(datasetId);
      res.status(200).json({ message: "Dataset deleted successfully" });
    } catch (error) {
      next(error);
    }
  });
  
  // Admin endpoint to get all users (protected, admin only)
  app.get("/api/admin/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // For this demo, we'll consider the first registered user (testuser) as admin
      // In a real app, you'd have proper role-based access control
      const user = req.user as Express.User;
      if (user.id !== 1) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  // Model analysis endpoints
  
  // Get valid techniques based on dataset constraints
  app.get("/api/constraints/:datasetId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() && !req.isGuest?.()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const datasetId = parseInt(req.params.datasetId);
      const dataset = await storage.getDataset(datasetId);
      
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      // Read constraints from the JSON file
      const constraintsPath = path.join(process.cwd(), 'shared/rules/constraints.json');
      const constraints = JSON.parse(fs.readFileSync(constraintsPath, 'utf8'));
      
      // Check which techniques are valid for this dataset
      // Here we're using a simple check based on number of columns
      type Rule = {
        technique: string;
        internal_code: string;
        category: string;
        min_numeric_features: number;
        output_types: string[];
      };
      
      const validTechniques = constraints.filter((rule: Rule) => {
        // We're assuming columns are numeric features for simplicity
        // In a real app, you'd analyze the dataset to determine the number of numeric columns
        return dataset.columns !== null && dataset.columns >= rule.min_numeric_features;
      }).map((rule: Rule) => ({
        name: rule.technique,
        code: rule.internal_code,
        tags: [rule.category],
        output_types: rule.output_types
      }));
      
      res.json({ valid_techniques: validTechniques });
    } catch (error) {
      next(error);
    }
  });

  // Get schema information for a dataset
  app.get("/api/schema/:datasetId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() && !req.isGuest?.()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const datasetId = parseInt(req.params.datasetId);
      if (isNaN(datasetId)) {
        return res.status(400).json({ message: "Invalid dataset ID" });
      }
      
      const dataset = await storage.getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      const userId = req.isAuthenticated() 
        ? (req.user as Express.User).id 
        : -1; // Use -1 as a placeholder for guest user ID

      // First try to get schema from session data for backward compatibility
      const userSessionData = sessionData[userId] || {};
      
      // Then try to get schema from database
      let datasetObj = await storage.getDataset(datasetId);
      if (!datasetObj) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      let schemaData;
      
      // Try to get schema from session first (for backward compatibility)
      if (userSessionData.schema) {
        schemaData = userSessionData.schema;
      } 
      // Then try to get it from database
      else if (datasetObj.schemaData) {
        try {
          schemaData = JSON.parse(datasetObj.schemaData);
        } catch (err) {
          console.error("Error parsing schema data from database:", err);
          return res.status(500).json({ 
            message: "Schema information corrupted",
            details: "Could not parse schema data. Try re-uploading the file."
          });
        }
      } else {
        return res.status(404).json({ 
          message: "Schema information not found",
          details: "The dataset schema could not be inferred. Try re-uploading the file."
        });
      }
      
      // Transform schema to the expected format
      const columns = Object.keys(schemaData).map(colName => {
        const colInfo = schemaData[colName];
        return {
          name: colName,
          type: colInfo.type === 'numeric' ? 'numeric' : 
                colInfo.type === 'datetime' ? 'datetime' : 
                colInfo.type === 'boolean' ? 'boolean' : 
                colInfo.type === 'text' ? 'text' : 'categorical',
          nullPercentage: colInfo.null_percentage || 0,
          cardinality: colInfo.distinct_values || 0,
          min: colInfo.min,
          max: colInfo.max,
          mean: colInfo.mean
        };
      });
      
      res.json({ columns });
    } catch (error) {
      console.error("Error retrieving schema:", error);
      res.status(500).json({ 
        message: "Error retrieving schema information", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Run a selected technique on a dataset
  app.post("/api/run/:technique/:datasetId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() && !req.isGuest?.()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { technique, datasetId } = req.params;
      const params = req.body || {};
      const userId = req.isAuthenticated() 
        ? (req.user as Express.User).id 
        : -1; // Use -1 as a placeholder for guest user ID
      
      const dataset = await storage.getDataset(parseInt(datasetId));
      
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      // First try to get file path from session (backward compatibility)
      const userSessionData = sessionData[userId] || {};
      let filePath = userSessionData.filePath;
      
      // If not in session, try to get it from database
      if (!filePath || !fs.existsSync(filePath)) {
        if (dataset.filePath && fs.existsSync(dataset.filePath)) {
          filePath = dataset.filePath;
          
          // Update session data for backward compatibility
          if (!sessionData[userId]) {
            sessionData[userId] = {};
          }
          sessionData[userId].filePath = filePath;
        } else {
          return res.status(404).json({ 
            message: "Dataset file not found",
            details: "The original uploaded file is no longer available."
          });
        }
      }
      
      // Create a temporary JSON file to store the data
      const tempFile = path.join(os.tmpdir(), `dataset_${datasetId}.json`);

      try {
        // Read the CSV file and convert to JSON
        const results: any[] = [];
        
        // Process the CSV file and convert to JSON
        await new Promise<void>((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data: any) => results.push(data))
            .on('end', () => {
              fs.writeFileSync(tempFile, JSON.stringify(results));
              resolve();
            })
            .on('error', (err: Error) => reject(err));
        });
        
        console.log(`Converted CSV file to JSON with ${results.length} rows`);
      } catch (err) {
        console.error('Error processing CSV file:', err);
        return res.status(500).json({ 
          message: "Failed to process dataset file",
          details: err instanceof Error ? err.message : String(err)
        });
      }
      
      // Define which techniques we support
      const supportedTechniques = [
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
      ];
      
      if (!supportedTechniques.includes(technique)) {
        return res.status(400).json({ message: `Unsupported technique: ${technique}` });
      }
      
      // Check if Python implementation exists in backend folder
      const pythonScripts = [
        path.join(process.cwd(), `backend/logic/${technique}.py`),
        path.join(process.cwd(), `server/logic/${technique}.py`)
      ];
      
      const pythonScript = pythonScripts.find(script => fs.existsSync(script));
      
      if (!pythonScript) {
        return res.status(500).json({ 
          error: `Implementation for ${technique} not found`,
          details: `Checked paths: ${JSON.stringify(pythonScripts)}`
        });
      }
      
      return new Promise((resolve, reject) => {
        // Check if the run_model.py script exists
        const runModelScript = [
          path.join(process.cwd(), 'backend/api/run_model.py'),
          path.join(process.cwd(), 'server/api/run_model.py')
        ].find(script => fs.existsSync(script));

        let pythonProcess;
        
        // If run_model.py exists, use it to run the technique
        if (runModelScript) {
          console.log(`Using run_model.py to execute ${technique}`);
          const pythonArgs = [runModelScript, technique, tempFile];
          
          // Add technique-specific parameters if provided
          for (const [key, value] of Object.entries(params)) {
            pythonArgs.push(`${key}=${value}`);
          }
          
          pythonProcess = spawn('python', pythonArgs);
        } else {
          // Fall back to directly calling the technique script
          console.log(`Directly executing ${technique} script`);
          const pythonArgs = [pythonScript, tempFile];
          
          // Add technique-specific parameters if provided
          if (params.nClusters && technique === 'kmeans') {
            pythonArgs.push(params.nClusters.toString());
          }
          
          pythonProcess = spawn('python', pythonArgs);
        }
        
        let resultData = '';
        let errorData = '';
        
        pythonProcess.stdout.on('data', (data: Buffer) => {
          resultData += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data: Buffer) => {
          const stderr = data.toString();
          errorData += stderr;
          console.error(`[PYTHON ERROR] ${technique}:`, stderr);
        });
        
        pythonProcess.on('close', (code: number) => {
          console.log(`Python process for ${technique} exited with code:`, code);
          
          // Clean up the temporary file
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
          
          if (code !== 0) {
            console.error(`Python process error (${technique}):`, errorData);
            return res.status(500).json({ 
              error: `Error running ${technique} algorithm`,
              details: errorData,
              exit_code: code
            });
          }
          
          try {
            // Log the result for debugging
            console.log(`Raw result from ${technique}:`, resultData);
            
            // Try to handle empty or invalid responses
            if (!resultData || resultData.trim() === '') {
              return res.status(500).json({
                error: `Empty response from ${technique}`,
                charts: {},
                stats: { error: `The ${technique} algorithm returned an empty response` },
                tables: {},
                explanation: `The requested analysis could not be completed due to an empty response.`
              });
            }

            // Clean up the resultData by removing any non-JSON content
            // Sometimes Python can output warnings or messages before the actual JSON
            let cleanedResult = resultData;
            const jsonStartIndex = resultData.indexOf('{');
            if (jsonStartIndex > 0) {
              cleanedResult = resultData.substring(jsonStartIndex);
            }
            
            // Parse the result
            const result = JSON.parse(cleanedResult);
            
            // Return a well-formed response with defaults for missing fields
            const response = {
              charts: result.charts || {},
              stats: result.stats || {},
              tables: result.tables || {},
              explanation: result.explanation || `Analysis completed with ${technique}.`
            };
            
            console.log(`Sending response for ${technique}:`, JSON.stringify(response).substring(0, 200) + '...');
            res.json(response);
          } catch (err: unknown) {
            const error = err as Error;
            console.error(`JSON parse error for ${technique}:`, error.message, `\nData: ${resultData}`);
            
            // Return a graceful error response
            res.status(500).json({ 
              error: `Failed to parse ${technique} result`,
              details: error.message,
              charts: {},
              stats: { error: `Error parsing the ${technique} algorithm result` },
              tables: {},
              explanation: `The requested analysis could not be completed due to a data formatting error.`
            });
          }
        });
      });
    } catch (error) {
      next(error);
    }
  });

  // Dataset data access endpoint - returns sample rows
  app.get("/api/data/:datasetId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() && !req.isGuest?.()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const datasetId = parseInt(req.params.datasetId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      const dataset = await storage.getDataset(datasetId);
      
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      // If this is an authenticated user, check if they own the dataset
      if (req.isAuthenticated()) {
        const user = req.user as Express.User;
        if (dataset.userId !== user.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      // Find the file path
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadsDir, dataset.filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Dataset file not found" });
      }
      
      // Parse the CSV file to get a limited number of rows
      const rows: any[] = [];
      
      try {
        await new Promise<void>((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
              if (rows.length < limit) {
                rows.push(row);
              }
            })
            .on('end', () => {
              resolve();
            })
            .on('error', (err: Error) => reject(err));
        });
        
        console.log("Converted CSV file to JSON with", rows.length, "rows");
        res.json({ rows, total: dataset.rows, count: rows.length });
      } catch (err) {
        console.error("Error reading dataset:", err);
        res.status(500).json({ message: "Error reading dataset file" });
      }
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
