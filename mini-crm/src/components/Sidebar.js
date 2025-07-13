import React from 'react';

const Sidebar = () => {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="border-r border-gray-200 p-4 text-sm bg-white">
      <div className="text-lg font-semibold mb-4 text-gray-900">Nodes</div>
      <div className="space-y-4">
        <div
          className="flex items-center p-3 rounded-md border border-gray-300 bg-white text-gray-900 cursor-grab"
          onDragStart={(event) => onDragStart(event, 'trigger', 'Lead Created Trigger')}
          draggable
        >
          <span className="mr-2 text-gray-700">▶️</span> Trigger
        </div>
        <div
          className="flex items-center p-3 rounded-md border border-gray-300 bg-white text-gray-900 cursor-grab"
          onDragStart={(event) => onDragStart(event, 'action', 'Send Welcome Email')}
          draggable
        >
          <span className="mr-2 text-gray-700">✉️</span> Send Email
        </div>
        <div
          className="flex items-center p-3 rounded-md border border-gray-300 bg-white text-gray-900 cursor-grab"
          onDragStart={(event) => onDragStart(event, 'action', 'Update Lead Status')}
          draggable
        >
          <span className="mr-2 text-gray-700">🔄</span> Update Status
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;