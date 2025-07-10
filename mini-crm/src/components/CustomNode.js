import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FaPlay, FaEnvelope, FaSyncAlt } from 'react-icons/fa'; // Icons for different node types

const CustomNode = ({ data, type, isExecuting }) => {
    let icon;
    let bgColor;
    let borderColor;
    let textColor = 'text-white';

    switch (type) {
        case 'trigger':
            icon = <FaPlay className="text-white" />;
            bgColor = 'bg-blue-600';
            borderColor = 'border-blue-800';
            break;
        case 'action':
            if (data.label.includes('Email')) {
                icon = <FaEnvelope className="text-white" />;
                bgColor = 'bg-green-600';
                borderColor = 'border-green-800';
            } else if (data.label.includes('Status')) {
                icon = <FaSyncAlt className="text-white" />;
                bgColor = 'bg-orange-600';
                borderColor = 'border-orange-800';
            }
            break;
        default:
            icon = <FaPlay className="text-white" />;
            bgColor = 'bg-gray-600';
            borderColor = 'border-gray-800';
    }

    return (
        <div className={`p-4 shadow-lg rounded-lg ${bgColor} border ${borderColor} ${textColor} flex items-center ${isExecuting ? 'animate-pulse-glow' : ''}`}>
            <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-white rounded-full border border-gray-400" />
            <div className="flex items-center space-x-3">
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white bg-opacity-20">
                    {icon}
                </div>
                <div className="text-base font-medium">{data.label}</div>
            </div>
            <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-white rounded-full border border-gray-400" />
        </div>
    );
};

export default CustomNode;