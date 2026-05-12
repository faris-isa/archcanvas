import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useReactFlow } from '@xyflow/react';
import { apiClient } from '../../api/client';

export const SaveButton: React.FC = () => {
  const { nodes, edges } = useCanvasStore();
  const { toObject } = useReactFlow();
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    const name = prompt('Enter pipeline name:', 'New Pipeline');
    if (!name) return;

    setLoading(true);
    try {
      const canvasState = JSON.stringify(toObject());
      await apiClient.createPipeline(name, canvasState);
      alert('Pipeline saved successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      const message = error.data?.error || error.message || 'Unknown error';
      alert(`Failed to save pipeline: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onSave}
      disabled={loading}
      className="px-4 py-1.5 bg-tech-gray border border-industrial-gray hover:border-gray-400 rounded text-sm font-bold transition-colors disabled:opacity-50"
    >
      {loading ? 'Saving...' : 'Save'}
    </button>
  );
};
