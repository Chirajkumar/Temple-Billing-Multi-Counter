import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sevasAPI } from '../../services/api.js';

const AddSeva = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm(); 
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Validate required fields
      if (!data.name || !data.price || !data.duration) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Format availableDays - convert to array if it's a multi-select
      const sevaData = {
        name: data.name,
        category: data.category || 'Daily Seva',
        price: parseFloat(data.price),
        duration: parseInt(data.duration),
        maxDevotees: parseInt(data.maxDevotees) || 1,
        availableDays: Array.isArray(data.availableDays) ? data.availableDays : (data.availableDays ? [data.availableDays] : []),
        description: data.description || ''
      };

      await sevasAPI.create(sevaData);
      toast.success('Seva added successfully!');
      reset();
      
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add seva';
      toast.error(errorMessage);
      console.error('Seva creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add Seva</h1>
          <p className="text-gray-600">Create a new Seva service</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seva Name</label>
              <input 
                type="text"
                {...register('name', { required: 'Seva name is required' })} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g. Abhishekam, Archana"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                {...register('category')} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="">Select Category</option>
                <option>Daily Seva</option>
                <option>Special Seva</option>
                <option>Festival Seva</option>
                <option>Archana</option>
                <option>Abhishekam</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (₹)</label>
              <input 
                type="number" 
                {...register('price', { required: 'Price is required', min: 0 })} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <input 
                type="number" 
                min="5"
                {...register('duration', { required: 'Duration is required', min: 5 })} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g. 30"
              />
              {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Devotees</label>
              <input 
                type="number" 
                min="1"
                {...register('maxDevotees', { required: 'Max devotees is required', min: 1 })} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g. 5"
              />
              {errors.maxDevotees && <p className="text-red-500 text-xs mt-1">{errors.maxDevotees.message}</p>}
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Days (select multiple)</label>
              <select 
                multiple 
                {...register('availableDays')} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-32"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Slots (comma separated)</label>
              <textarea 
                rows="2"
                {...register('timeSlots')} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-vertical"
                placeholder="e.g. 6AM,8AM,10AM,12PM"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                {...register('status', { required: 'Status is required' })} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                {...register('description')} 
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-vertical"
                placeholder="Enter seva description, timing, devotees limit etc..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => reset()}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Seva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSeva;

