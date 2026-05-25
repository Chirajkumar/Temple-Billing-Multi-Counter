import React from 'react';
import { useForm } from 'react-hook-form';

const AddRoomForm = ({ onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = (data) => {
    onSuccess(data);
    reset();
  };

  const roomTypes = ['AC Single', 'AC Double', 'Non-AC Single', 'Non-AC Double', 'VIP Suite'];


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Room ID</label>
        <input
          type="text"
          {...register('id', { required: 'Room ID required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="e.g. ROOM101"
        />
        {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id.message}</p>}
      </div>

      <div>


        <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
        <select
          {...register('type', { required: 'Room type required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">Select Room Type</option>
          {roomTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>


        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
      </div>

      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
        <input
          type="number"
          min="1"
          max="10"
          {...register('capacity', { required: 'Capacity required', min: 1, max: 10 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="e.g. 2"
        />

        {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price per Day (₹)</label>
        <input
          type="number"
          min="0"
          {...register('price', { required: 'Price required', min: 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="e.g. 1500"
        />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          {...register('status')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add Room
        </button>
      </div>
    </form>
  );
};

export default AddRoomForm;

