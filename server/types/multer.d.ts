declare module 'multer' {
  import { Request } from 'express';

  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  interface FileFilterCallback {
    (error: Error | null, acceptFile: boolean): void;
  }

  interface MulterOptions {
    dest?: string;
    storage?: any;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    fileFilter?(
      req: Request,
      file: File,
      callback: FileFilterCallback
    ): void;
  }

  interface Multer {
    (options?: MulterOptions): any;
    diskStorage(options: any): any;
    memoryStorage(): any;
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: Array<{ name: string, maxCount?: number }>): any;
    none(): any;
  }

  const multer: Multer;
  export = multer;
}

// Also extend Express Request to include file
declare global {
  namespace Express {
    interface Request {
      file?: any;
      files?: any;
    }
  }
}