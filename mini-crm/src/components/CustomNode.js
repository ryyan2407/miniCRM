import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FaPlay, FaEnvelope, FaSyncAlt } from 'react-icons/fa'; 

const CustomNode = ({ data, type, isExecuting }) => {
    let icon;
    let bgColor = 'bg-white';
    let borderColor = 'border-gray-300';
    let textColor = 'text-gray-900';

    switch (type) {
        case 'trigger':
            icon = <FaPlay className="text-gray-700" />;
            break;
        case 'action':
            if (data.label.includes('Email')) {
                icon = <FaEnvelope className="text-gray-700" />;
            } else if (data.label.includes('Status')) {
                icon = <FaSyncAlt className="text-gray-700" />;
            }
            break;
        default:
            icon = <FaPlay className="text-gray-700" />;
    }

    return (
        <div className={`p-4 rounded-lg ${bgColor} border ${borderColor} ${textColor} flex items-center ${isExecuting ? 'animate-pulse-glow' : ''}`}>
            <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-gray-300 rounded-full border border-gray-400" />
            <div className="flex items-center space-x-3">
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white">
                    {icon}
                </div>
                <div className="text-base font-medium">{data.label}</div>
            </div>
            <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-gray-300 rounded-full border border-gray-400" />
        </div>
    );
};

export default CustomNode;
