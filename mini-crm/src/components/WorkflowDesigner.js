import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

const WorkflowDesigner = ({ showToastMessage }) => {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'custom', data: { isExecuting: false } }, eds)), [setEdges]);

  const addNode = useCallback((type, label) => {
    if (nodes.length >= 3) {
      showToastMessage('Maximum 3 nodes allowed.');
      return;
    }
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      data: { label, isExecuting: false },
      position: { x: Math.random() * 250, y: Math.random() * 250 }, 
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes, showToastMessage]);

  const handleRunWorkflow = useCallback(async () => {
    
    setNodes(nds => nds.map(node => ({ ...node, data: { ...node.data, isExecuting: false } })));
    setEdges(eds => eds.map(edge => ({ ...edge, data: { ...edge.data, isExecuting: false } })));
    await new Promise(resolve => setTimeout(resolve, 100)); 

    
    const triggerNodes = nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length !== 1) {
      showToastMessage('Workflow must have exactly one trigger node.');
      return;
    }
    const triggerNode = triggerNodes[0];

    
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const unconnectedNodes = nodes.filter(node => {
      if (node.id === triggerNode.id) {
        return !edges.some(edge => edge.source === node.id);
      } else {
        return !connectedNodeIds.has(node.id);
      }
    });

    if (unconnectedNodes.length > 0) {
      showToastMessage(`Unconnected nodes found: ${unconnectedNodes.map(node => node.data.label).join(', ')}. All nodes must be connected.`);
      return;
    }

    
    console.log('--- Starting Workflow Simulation ---');
    let currentNode = triggerNode;
    const simulationDelay = 700; 

    while (currentNode) {
      
      setNodes(nds => nds.map(node =>
        node.id === currentNode.id
          ? { ...node, data: { ...node.data, isExecuting: true } }
          : { ...node, data: { ...node.data, isExecuting: false } }
      ));
      showToastMessage(`Executing: ${currentNode.data.label}`);
      await new Promise(resolve => setTimeout(resolve, simulationDelay));

      const outgoingEdges = edges.filter(edge => edge.source === currentNode.id);

      if (outgoingEdges.length > 0) {
        
        const nextEdge = outgoingEdges[0];
        setEdges(eds => eds.map(edge =>
          edge.id === nextEdge.id
            ? { ...edge, data: { ...edge.data, isExecuting: true } }
            : { ...edge, data: { ...edge.data, isExecuting: false } }
        ));
        console.log(`Edge ${nextEdge.id} isExecuting: true`);
        await new Promise(resolve => setTimeout(resolve, simulationDelay));

        const nextNodeId = nextEdge.target;
        currentNode = nodes.find(node => node.id === nextNodeId);
      } else {
        currentNode = null; 
      }
    }

    
    setNodes(nds => nds.map(node => ({ ...node, data: { ...node.data, isExecuting: false } })));
    setEdges(eds => eds.map(edge => ({ ...edge, data: { ...edge.data, isExecuting: false } })));
    console.log('All nodes and edges reset to isExecuting: false');
    showToastMessage('Workflow simulation complete!');
    console.log('--- Workflow Simulation Finished ---');

  }, [nodes, edges, setNodes, setEdges, showToastMessage]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    
    if (!isFullscreen) {
      setTimeout(() => fitView(), 100); 
    }
  };

    const nodeTypes = React.useMemo(() => ({
    trigger: (props) => <CustomNode {...props} isExecuting={props.data.isExecuting} />,
    action: (props) => <CustomNode {...props} isExecuting={props.data.isExecuting} />,
  }), []);

  const edgeTypes = React.useMemo(() => ({
    custom: CustomEdge,
  }), []);

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-white p-4 flex flex-col'
    : 'bg-white rounded-lg p-6 flex flex-col';

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Workflow Designer</h2>
        <div className="flex space-x-2">
          <button onClick={() => addNode('trigger', 'Lead Created')} className="px-3 py-1 rounded-md bg-gray-200 text-gray-800 text-sm hover:bg-gray-300">
            Add Trigger
          </button>
          <button onClick={() => addNode('action', 'Send Email')} className="px-3 py-1 rounded-md bg-gray-200 text-gray-800 text-sm hover:bg-gray-300">
            Add Send Email
          </button>
          <button onClick={() => addNode('action', 'Update Status')} className="px-3 py-1 rounded-md bg-gray-200 text-gray-800 text-sm hover:bg-gray-300">
            Add Update Status
          </button>
          <button onClick={handleRunWorkflow} className="px-3 py-1 rounded-md bg-gray-200 text-gray-800 text-sm hover:bg-gray-300">
            Run Workflow
          </button>
          <button onClick={toggleFullscreen} className="text-gray-400 hover:text-gray-600 transition-colors" title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <i className={`fa ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}/>
          </button>
        </div>
      </div>
      <div className="flex-grow w-full h-full rounded-lg border border-gray-200 bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        >
          <MiniMap />
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowDesigner;
