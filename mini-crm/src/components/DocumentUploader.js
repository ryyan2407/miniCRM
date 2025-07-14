import React, { useState, useRef } from 'react';
import apiClient from '../api/apiClient';


const DocumentUploader = ({ onLeadsExtracted }) => {
    const [uiState, setUiState] = useState('idle'); 
    const [fileName, setFileName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);

    const resetUploader = () => {
        setUiState('idle');
        setFileName('');
        setErrorMessage('');
    };

    const handleFileSelect = async (file) => {
        if (!file) return;

        setUiState('uploading');
        setFileName(file.name);
        setErrorMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/api/extract-leads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onLeadsExtracted(response.data.leads);
            
            setUiState('success');
            setTimeout(resetUploader, 2000); 

        } catch (error) {
            console.error("Error uploading file:", error);
            const message = error.response?.data?.detail || "Upload failed. Check the console and ensure the backend is running.";
            setErrorMessage(message);
            setUiState('error');
        }
    };

    
    const handleClick = () => {
      if (uiState === 'error') {
        resetUploader();
      } else {
        fileInputRef.current.click();
      }
    };
    const handleFileChange = (e) => handleFileSelect(e.target.files[0]);
    
    
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    
    const renderContent = () => {
        switch (uiState) {
            case 'uploading':
                return (
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="text-gray-600">Processing document...</p>
                        <p className="text-sm font-medium text-gray-800 truncate max-w-full">{fileName}</p>
                    </div>
                );
            case 'success':
                return (
                     <div className="flex flex-col items-center justify-center space-y-2">
                        <i className="fas fa-check-circle text-4xl text-green-500"></i>
                        <p className="text-gray-600">Success!</p>
                        <p className="text-sm text-gray-500">New leads added to your dashboard.</p>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <i className="fas fa-times-circle text-4xl text-red-500"></i>
                        <p className="text-gray-600 font-semibold">Upload Failed</p>
                        <p className="text-sm text-red-600">{errorMessage}</p>
                        <p className="text-xs text-gray-400 mt-2">Click to try again</p>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <i className="fas fa-file-upload text-4xl text-gray-400"></i>
                        <p className="text-gray-500">Drop a PDF/Image file here</p>
                        <p className="text-sm text-gray-400">or click to browse</p>
                    </div>
                );
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Scan Document for Leads</h2>
            <div
                className="drag-drop-zone rounded-lg p-8 text-center cursor-pointer h-48 flex items-center justify-center"
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {renderContent()}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                disabled={uiState === 'uploading'}
            />
        </div>
    );
};

export default DocumentUploader;
