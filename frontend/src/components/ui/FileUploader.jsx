import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

const FileUploader = ({ files, onFilesChange, maxFiles = 5 }) => {
    const onDrop = useCallback(acceptedFiles => {
        const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
        onFilesChange(newFiles);
    }, [files, onFilesChange, maxFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const removeFile = (index, e) => {
        e.stopPropagation();
        const newFiles = files.filter((_, i) => i !== index);
        onFilesChange(newFiles);
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            return <ImageIcon className="w-5 h-5 text-blue-500" />;
        }
        return <FileText className="w-5 h-5 text-gray-500" />;
    };

    return (
        <div className="space-y-3">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}
                `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2 text-[var(--color-text-secondary)]">
                    <Upload className="w-8 h-8" />
                    {isDragActive ? (
                        <p>Drop the files here ...</p>
                    ) : (
                        <p>Drag & drop files here, or click to select files</p>
                    )}
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-md bg-[var(--color-surface-highlight)] border border-[var(--color-border)]">
                            <div className="flex items-center gap-2 overflow-hidden">
                                {getFileIcon(file.name)}
                                <span className="text-sm truncate text-[var(--color-text-primary)]">{file.name}</span>
                                <span className="text-xs text-[var(--color-text-secondary)]">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => removeFile(index, e)}
                                className="p-1 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUploader;
