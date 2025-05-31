import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { ScanResult } from '@/types';
import { format } from 'date-fns';

interface HistoryCardProps {
  scanResult: ScanResult;
  onClick: (id: string) => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ scanResult, onClick }) => {
  const { id, productName, timestamp, isSafe, imageUrl, base64Image } = scanResult;
  
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow" onClick={() => onClick(id)}>
      <CardContent className="p-4 flex justify-between items-center cursor-pointer">
        <div className="flex items-start space-x-3">
          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
            {(imageUrl || base64Image) && (
              <img 
                src={imageUrl || base64Image} 
                alt={`Thumbnail of ${productName}`} 
                className="w-full h-full object-cover" 
              />
            )}
          </div>
          
          <div>
            <div className="flex items-center">
              <h3 className="text-base font-medium text-gray-900">{productName}</h3>
              {isSafe ? (
                <Badge variant="outline" className="ml-2 bg-success-100 text-success-800 hover:bg-success-200">
                  Safe
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-2 bg-danger-100 text-danger-800 hover:bg-danger-200">
                  Unsafe
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {format(new Date(timestamp), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </CardContent>
    </Card>
  );
};

export default HistoryCard;
