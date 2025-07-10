import React, { useState, useRef, useCallback } from 'react';

const DocumentUploader = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef(null);
    const uploadIntervalRef = useRef(null);

    const resetUploader = useCallback(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setFileName('');
        if (uploadIntervalRef.current) {
            clearInterval(uploadIntervalRef.current);
            uploadIntervalRef.current = null;
        }
    }, []);

    const simulateUpload = (file) => {
        if (!file) return;

        setFileName(file.name);
        setIsUploading(true);
        setUploadProgress(0);

        uploadIntervalRef.current = setInterval(() => {
            setUploadProgress(prevProgress => {
                const newProgress = prevProgress + Math.random() * 20;
                if (newProgress >= 100) {
                    clearInterval(uploadIntervalRef.current);
                    setTimeout(resetUploader, 1500);
                    return 100;
                }
                return newProgress;
            });
        }, 300);
    };

    const handleFileSelect = (files) => {
        if (files && files.length > 0) {
            simulateUpload(files[0]);
        }
    };

    const handleClick = () => fileInputRef.current.click();
    const handleFileChange = (e) => handleFileSelect(e.target.files);
    const handleCancel = (e) => {
        e.stopPropagation();
        resetUploader();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };
    
    const circumference = 2 * Math.PI * 16;
    const strokeDashoffset = circumference - (uploadProgress / 100) * circumference;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Import Leads</h2>
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {!isUploading ? (
                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                        <i className="fa fa-cloud-upload fa-2x"></i>
                        <p>Drop a PDF/Image here</p>
                        <p className="text-sm text-gray-400">or click to browse</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative w-20 h-20 mb-4">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200" strokeWidth="3" />
                                <circle
                                    cx="18" cy="18" r="16" fill="none"
                                    className="stroke-current text-blue-600" strokeWidth="3"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                />
                                <text x="18" y="21" textAnchor="middle" className="text-sm font-semibold fill-current text-blue-600">{`${Math.round(uploadProgress)}%`}</text>
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-800 truncate max-w-full">{fileName}</p>
                        <p className="text-sm text-gray-500">{uploadProgress < 100 ? 'Uploading...' : 'Upload Complete!'}</p>
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
            />
            {isUploading && (
                <button onClick={handleCancel} className="mt-4 w-full text-sm text-center text-red-500 hover:text-red-700 font-medium transition-colors">
                    Cancel
                </button>
            )}
        </div>
    );
};

export default DocumentUploader;