import React from 'react';
import { BaseEdge, getSimpleBezierPath, EdgeLabelRenderer } from '@xyflow/react';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd, isExecuting }) => {
  const [edgePath, labelX, labelY] = getSimpleBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ ...style, strokeWidth: isExecuting ? 3 : 2, stroke: isExecuting ? '#10B981' : '#9CA3AF' }} markerEnd={markerEnd} className={isExecuting ? 'animate-pulse-glow' : ''} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
