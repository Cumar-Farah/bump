import { Request, Response, NextFunction } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { spawn } from 'child_process';
import { insertDatasetSchema } from "@shared/schema";
import { storage } from "../storage";

// Local in-memory session storage
export const sessionData: Record<string, any> = {};

// Multer config
const upload = multer({
  dest: path.join(os.tmpdir(), 'bumpdata-uploads'),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimetypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// Python schema inference subprocess
const analyzeFileWithPython = (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      '-c',
      `
import pandas as pd, sys, json
sys.path.append("${path.resolve('server/engine')}")
from schema_infer import infer_schema

try:
    df = pd.read_csv("${filePath}")
    schema = infer_schema(df)
    print(json.dumps({
        "success": True,
        "rows": len(df),
        "columns": len(df.columns),
        "schema": schema
    }))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
      `
    ]);

    let output = '';
    pythonProcess.stdout.on('data', (data) => output += data.toString());
    pythonProcess.stderr.on('data', (err) => console.error("Python stderr:", err.toString()));
    pythonProcess.on('close', () => {
      try {
        resolve(JSON.parse(output));
      } catch (e) {
        reject(new Error("Failed to parse Python output"));
      }
    });
  });
};

// Main upload handler
export const handleFileUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'guest';

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { originalname: filename, size: filesize, path: filepath } = req.file;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const permanentFilename = `${Date.now()}-${filename}`;
    const permanentFilePath = path.join(uploadsDir, permanentFilename);
    fs.copyFileSync(filepath, permanentFilePath);

    let schema = {}, rows = 0, columns = 0;
    try {
      const result = await analyzeFileWithPython(filepath);
      if (!result.success) throw new Error(result.error);
      schema = result.schema;
      rows = result.rows;
      columns = result.columns;
    } catch (err) {
      console.warn("Schema analysis failed, continuing:", err);
    }

    // Save dataset in your DB or wherever
    const datasetData = insertDatasetSchema.parse({
      userId,
      filename,
      filesize,
      filePath: permanentFilePath,
      schemaData: JSON.stringify(schema),
      rows,
      columns
    });

    const dataset = await storage.createDataset(datasetData);

    // Store to memory (session)
    sessionData[userId] = {
      filePath: permanentFilePath,
      schema,
      data: fs.readFileSync(permanentFilePath, 'utf-8') // raw content
    };

    return res.status(201).json({ ...dataset, schema });
  } catch (err) {
    console.error("Upload error:", err);
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

export const uploadMiddleware = upload.single('file');
