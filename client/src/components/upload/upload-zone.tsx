import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CloudUpload } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingBar from './loading-bar';
import { useUploadContext } from '@/contexts/upload-context';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const UploadZone: React.FC = () => {
  const { isLoading, uploadFile, setSelectedDataset } = useUploadContext();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      // Set initial progress
      setUploadProgress(10);
      
      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      await uploadFile(file);
      
      // Clear progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Show success toast
      toast({
        title: "Upload successful",
        description: "Your dataset has been uploaded and analyzed. Redirecting to insights page...",
      });
      
      // Navigate to insights page after a short delay
      setTimeout(() => {
        navigate('/insights');
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 text-center">
          <CloudUpload className="h-16 w-16 text-primary/70 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Upload your dataset</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Drag and drop your CSV or Excel file here, or click to browse
          </p>
          
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
              dragActive 
                ? "border-primary dark:border-primary" 
                : "border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls"
            />
            <div className="text-gray-500 dark:text-gray-400">
              <p className="mb-1">Supported formats: CSV, XLSX, XLS</p>
              <p className="text-sm">Maximum file size: 50MB</p>
            </div>
            <Button className="mt-4">
              Browse Files
            </Button>
          </div>
          
          {isLoading && <LoadingBar progress={uploadProgress} />}
          
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            By uploading files, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadZone;
