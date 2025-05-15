import React from 'react';
import { useLocation } from 'wouter';
import { useHistory } from '@/hooks/useHistory';
import HistoryCard from '@/components/HistoryCard';
import { History as HistoryIcon } from 'lucide-react';

const History = () => {
  const [, setLocation] = useLocation();
  const { history } = useHistory();
  
  const handleViewItem = (id: string) => {
    setLocation(`/result/${id}`);
  };
  
  return (
    <div className="flex-1 p-4">
      <h2 className="text-xl font-heading font-semibold mb-4">Scan History</h2>
      
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
