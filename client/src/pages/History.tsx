import React from 'react';
import { useLocation } from 'wouter';
import { useHistory } from '@/hooks/useHistory';
import HistoryCard from '@/components/HistoryCard';
import { Button } from '@/components/ui/button';
import { History as HistoryIcon, Trash2 } from 'lucide-react';

const History = () => {
  const [, setLocation] = useLocation();
  const { history, clearHistory } = useHistory();
  
  const handleViewItem = (id: string) => {
    setLocation(`/result/${id}`);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all scan history? This cannot be undone.')) {
      clearHistory();
    }
  };
  
  return (
    <div className="flex-1 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-heading font-semibold">Scan History</h2>
          <p className="text-sm text-gray-500 mt-1">
            {history.length} of 100 scans saved
          </p>
        </div>
        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>
      
      {history.length > 0 ? (
        history.map(item => (
          <HistoryCard
            key={item.id}
            scanResult={item}
            onClick={handleViewItem}
          />
        ))
      ) : (
        <div className="mt-4 text-center py-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <HistoryIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No history yet</h3>
          <p className="text-gray-500">Your scanned products will appear here</p>
        </div>
      )}
    </div>
  );
};

export default History;
