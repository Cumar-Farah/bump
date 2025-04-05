export interface UploadResponse {
  id: number;
  fileName: string;
  fileSize: number;
  rows: number;
  columns: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: number;
    username: string;
    email: string;
    fullName?: string;
  } | null;
  authView: 'login' | 'signup';
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  recentUploads: {
    id: number;
    filename: string;
    uploadedAt: string;
    filesize: number;
    rows: number | null;
    columns: number | null;
  }[];
}
