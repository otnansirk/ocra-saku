'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Upload, Loader2, FileImage, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LogoSimilarityFormProps {
  onSubmit: (file: File) => void;
  isLoading: boolean;
}

export function LogoSimilarityForm({ onSubmit, isLoading }: LogoSimilarityFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB.');
        setFile(null);
      } else if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(selectedFile.type)) {
        setError('Invalid file type. Please upload a JPG, PNG, or SVG.');
        setFile(null);
      } else {
        setError(null);
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (file) {
      onSubmit(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Logo Similarity Search</CardTitle>
        <CardDescription>Upload your logo to find visually similar designs and potential conflicts.</CardDescription>
      </CardHeader>
      <CardTitle className='text-center p-10 text-gray-400'>SABAAR MENYUSUL</CardTitle>
      {/* <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="logo-file">Logo File</Label>
                <div className="relative flex h-32 w-full flex-col items-center justify-center rounded-md border-2 border-dashed">
                    <Input
                    id="logo-file"
                    type="file"
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    accept="image/png, image/jpeg, image/svg+xml"
                    aria-describedby="file-upload-instructions"
                    />
                    <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p id="file-upload-instructions" className="mt-2 text-sm text-muted-foreground">
                            {file ? 'Click to change file' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
                    </div>
                </div>
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                {file && !error && (
                    <div className="flex items-center justify-between rounded-md border bg-muted p-2 text-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileImage className="h-5 w-5 shrink-0" />
                            <span className="truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setFile(null)} aria-label="Remove file">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !file}>
                {isLoading ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <Upload />
                )}
                <span>Analyze Logo</span>
            </Button>
        </form>
      </CardContent> */}
    </Card>
  );
}
