import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getShips, deleteShip, Ship } from '../../../firebase/firestore';

interface DeleteShipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteShipModal: React.FC<DeleteShipModalProps> = ({ isOpen, onClose }) => {
  const [selectedShipId, setSelectedShipId] = useState('');
  const [ships, setShips] = useState<Ship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch ships when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchShips();
    }
  }, [isOpen]);

  const fetchShips = async () => {
    setIsLoading(true);
    try {
      const shipsData = await getShips();
      setShips(shipsData);
    } catch (error) {
      console.error('Error fetching ships:', error);
      toast.error('Failed to load ships');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteShipMutation = {
    mutateAsync: async (shipId: string) => {
      setIsDeleting(true);
      try {
        await deleteShip(shipId);
        console.log('Ship deleted successfully:', shipId);
        toast.success('Ship deleted successfully!');
        // Refresh the ships list
        await fetchShips();
      } catch (error) {
        console.error('Error deleting ship:', error);
        toast.error('Failed to delete ship. Please try again.');
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    isLoading: isDeleting
  };
  const cruiseLinesData = {
    cruiseLines: [
      { id: '1', name: 'Carnival Cruise Line' },
      { id: '2', name: 'Royal Caribbean International' },
      { id: '3', name: 'Norwegian Cruise Line' }
    ]
  };
  const shipsData = {
    ships: [
      { id: '1', name: 'Carnival Horizon', cruise_line_id: '1' },
      { id: '2', name: 'Carnival Vista', cruise_line_id: '1' },
      { id: '3', name: 'Symphony of the Seas', cruise_line_id: '2' }
    ]
  };

  const handleCruiseLineChange = (cruiseLineId: string) => {
    setSelectedCruiseLineId(cruiseLineId);
    setSelectedShipId(''); // Reset ship selection when cruise line changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipId) {
      toast.error('Please select a ship to delete.');
      return;
    }

    try {
      await deleteShipMutation.mutateAsync(selectedShipId);
      onClose();
      setSelectedCruiseLineId('');
      setSelectedShipId('');
    } catch (error) {
      // Error handled by useDeleteShip's onError
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-600">Delete Ship</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="cruiseLine" className="block text-sm font-medium text-gray-700 mb-1">
                Select Cruise Line:
              </label>
              <select
                id="cruiseLine"
                value={selectedCruiseLineId}
                onChange={(e) => handleCruiseLineChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Choose a cruise line...</option>
                {cruiseLinesData?.cruiseLines?.map((cruiseLine: any) => (
                  <option key={cruiseLine.id} value={cruiseLine.id}>
                    {cruiseLine.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ship" className="block text-sm font-medium text-gray-700 mb-1">
                Select Ship to Delete:
              </label>
              <select
                id="ship"
                value={selectedShipId}
                onChange={(e) => setSelectedShipId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
                disabled={!selectedCruiseLineId}
              >
                <option value="">Choose a ship...</option>
                {shipsData?.ships?.map((ship: any) => (
                  <option key={ship.id} value={ship.id}>
                    {ship.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete the ship. Users assigned to this ship will need to be reassigned.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={deleteShipMutation.isLoading}
              >
                {deleteShipMutation.isLoading ? 'Deleting...' : 'Delete Ship'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
