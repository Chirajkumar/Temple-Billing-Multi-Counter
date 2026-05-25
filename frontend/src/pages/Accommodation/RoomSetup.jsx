import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/Common/DataTable';
import AlertMessage from '../../components/Common/AlertMessage';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { roomsAPI } from '../../services/api';

const normalizeRoom = (r) => ({
  ...r,
  id: r.roomId ?? r.id,
  _id: r._id,
});

const RoomForm = ({ onClose, onSuccess, initialRoom }) => {
  const isEdit = Boolean(initialRoom);
  const generatedRoomId = `ROOM${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialRoom
      ? {
          roomId: initialRoom.id,
          type: initialRoom.type,
          capacity: initialRoom.capacity,
          price: initialRoom.price,
          status: initialRoom.status || 'Active',
          facilities: initialRoom.facilities || '',
        }
      : { roomId: generatedRoomId, status: 'Active' },
  });

  const onSubmit = async (data) => {
    await onSuccess(data);
    reset();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Room ID *</label>
        <input
          type="text"
          {...register('roomId', { required: 'Room ID is required' })}
          readOnly
          className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100`}
          placeholder="Auto-generated"
        />
        {errors.roomId && <p className="text-red-500 text-xs mt-1">{errors.roomId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
        <select
          {...register('type', { required: 'Room type is required' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Room Type</option>
          <option value="AC Single">AC Single</option>
          <option value="AC Double">AC Double</option>
          <option value="Non-AC Single">Non-AC Single</option>
          <option value="Non-AC Double">Non-AC Double</option>
          <option value="VIP Suite">VIP Suite</option>
          <option value="Deluxe Room">Deluxe Room</option>
        </select>
        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
        <input
          type="number"
          {...register('capacity', { required: 'Capacity is required', min: 1 })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Number of persons"
        />
        {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price per Day (₹) *</label>
        <input
          type="number"
          {...register('price', { required: 'Price is required', min: 0 })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter price"
        />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Facilities</label>
        <input
          type="text"
          {...register('facilities')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. AC, TV, WiFi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          {...register('status')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {isEdit ? 'Update Room' : 'Save Room'}
        </button>
      </div>
    </form>
  );
};

const RoomSetup = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const loadRooms = useCallback(async () => {
    const data = await roomsAPI.getSetup();
    setRooms((data || []).map(normalizeRoom));
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        await loadRooms();
      } catch (error) {
        console.error('RoomSetup API error:', error);
        toast.error('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [loadRooms]);

  const columns = [
    { key: 'id', header: 'ROOM ID' },
    { key: 'type', header: 'ROOM TYPE' },
    { key: 'capacity', header: 'CAPACITY' },
    {
      key: 'price',
      header: 'PRICE PER DAY (₹)',
      render: (value) => `₹ ${Number(value).toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'STATUS',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'Active'
              ? 'bg-green-100 text-green-800'
              : value === 'Maintenance'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      render: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditRoom(row)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteRoom(row)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleAddClick = () => {
    setEditingRoom(null);
    setFormKey((prev) => prev + 1);
    setShowAddModal(true);
  };

  const handleAddRoom = async (data) => {
    try {
      const payload = {
        roomId: data.roomId,
        type: data.type,
        capacity: parseInt(data.capacity, 10),
        price: parseInt(data.price, 10),
        status: data.status || 'Active',
        facilities: data.facilities || '',
      };

      await roomsAPI.createSetup(payload);
      await loadRooms();
      setMessage(`Room ${payload.roomId} added successfully!`);
      toast.success('Room added successfully!');
      setFormKey((prev) => prev + 1);
    } catch (error) {
      console.error('RoomSetup add error:', error);
      toast.error(error.response?.data?.message || 'Failed to add room');
      throw error;
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setFormKey((prev) => prev + 1);
    setShowAddModal(true);
  };

  const handleUpdateRoom = async (data) => {
    try {
      const lookupId = editingRoom._id || editingRoom.id;
      const payload = {
        type: data.type,
        capacity: parseInt(data.capacity, 10),
        price: parseInt(data.price, 10),
        status: data.status || 'Active',
        facilities: data.facilities || '',
      };

      await roomsAPI.updateSetup(lookupId, payload);
      await loadRooms();
      setMessage(`Room ${editingRoom.id} updated successfully!`);
      toast.success('Room updated successfully!');
      setEditingRoom(null);
    } catch (error) {
      console.error('RoomSetup update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update room');
      throw error;
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Are you sure you want to delete room ${room.id}?`)) {
      return;
    }

    try {
      const lookupId = room._id || room.id;
      await roomsAPI.deleteSetup(lookupId);
      await loadRooms();
      setMessage(`Room ${room.id} deleted`);
      toast.success(`Room ${room.id} deleted`);
    } catch (error) {
      console.error('RoomSetup delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingRoom(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Room Setup</h1>
        <button
          onClick={handleAddClick}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition duration-200"
        >
          + Add New Room
        </button>
      </div>

      {message && <AlertMessage type="success" message={message} onClose={() => setMessage('')} />}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <DataTable data={rooms} columns={columns} searchPlaceholder="Search rooms..." />
          <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-500">
            Showing {rooms.length} of {rooms.length} entries
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <RoomForm
                key={formKey}
                initialRoom={editingRoom}
                onClose={closeModal}
                onSuccess={editingRoom ? handleUpdateRoom : handleAddRoom}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSetup;
