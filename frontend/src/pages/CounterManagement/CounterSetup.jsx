import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { counterAPI } from '../../services/api';

const CounterSetup = () => {
  const generateCounterCode = () => `CTR${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({ defaultValues: { code: generateCounterCode() } });
  const [counters, setCounters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const counterTypes = ['Seva', 'Donation', 'Prasada', 'Room', 'General'];
  const users = ['Ramesh', 'Suresh', 'Mahesh', 'Rajesh', 'Kumar']; // Placeholder - should come from user management




  useEffect(() => {
    fetchCounters();
  }, []);

  const fetchCounters = async () => {
    try {
      const data = await counterAPI.getAll();
      setCounters(data);
    } catch (error) {
      toast.error('Failed to fetch counters');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Prevent overwriting auto-generated code with an empty string
      const payload = { ...data };
      if (!payload.code || payload.code.trim() === '') {
        delete payload.code;
      }

      if (editingId) {
        await counterAPI.update(editingId, payload);
        toast.success('Counter updated successfully!');
      } else {
        await counterAPI.create({ ...payload, status: 'Active' });
        toast.success('Counter added successfully!');
      }
      setEditingId(null);
      // reset form with a new generated code for next counter
      reset({ code: generateCounterCode() });
      fetchCounters();
    } catch (error) {
      toast.error('Failed to save counter');
    }
  };

  const handleEdit = (counter) => {
    setEditingId(counter._id || counter.id);
    setValue('name', counter.name);
    setValue('code', counter.code);
    setValue('location', counter.location);
    setValue('assignedUser', counter.assignedUser);
    setValue('openingTime', counter.openingTime);
    setValue('closingTime', counter.closingTime);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this counter?')) {
      try {
        await counterAPI.delete(id);
        toast.success('Counter deleted successfully!');
        fetchCounters();
      } catch (error) {
        toast.error('Failed to delete counter');
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      const counter = counters.find(c => (c._id || c.id) === id);
      const newStatus = counter.status === 'Active' ? 'Inactive' : 'Active';
      await counterAPI.update(id, { ...counter, status: newStatus });
      toast.success('Counter status updated!');
      fetchCounters();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Add/Edit Counter Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white">
          <h1 className="text-2xl font-bold text-gray-800">
            {editingId ? 'Edit Counter' : 'Add New Counter'}
          </h1>
          <p className="text-gray-600 mt-1">Setup and manage billing counters</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Counter Name *
              </label>
              <select
                {...register('name', { required: 'Counter name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Counter Type</option>
                {counterTypes.map(type => (
                  <option key={type} value={`${type} Counter`}>{type} Counter</option>
                ))}
              </select>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Counter Code 
              </label>
              <input
                type="text"
                {...register('code')}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                placeholder="Auto-generated (e.g., CTR0001)"
              />

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                {...register('location', { required: 'Location is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Main Hall, Entrance"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned User
              </label>
              <select
                {...register('assignedUser')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Time *
              </label>
              <input
                type="time"
                {...register('openingTime', { required: 'Opening time is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.openingTime && <p className="text-red-500 text-xs mt-1">{errors.openingTime.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Time *
              </label>
              <input
                type="time"
                {...register('closingTime', { required: 'Closing time is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.closingTime && <p className="text-red-500 text-xs mt-1">{errors.closingTime.message}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  reset({ code: generateCounterCode() });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
            >
              {editingId ? 'Update Counter' : 'Add Counter'}
            </button>
          </div>
        </form>
      </div>

      {/* Counters List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Counter List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counter Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {counters.map((counter) => (
                <tr key={counter._id || counter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{counter.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{counter.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{counter.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{counter.assignedUser || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {counter.openingTime} - {counter.closingTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      counter.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {counter.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(counter)} className="text-blue-600 hover:text-blue-900">
                      <FiEdit2 className="inline mr-1" /> Edit
                    </button>
                    <button onClick={() => toggleStatus(counter._id || counter.id)} className="text-yellow-600 hover:text-yellow-900">
                      {counter.status === 'Active' ? <FiToggleRight className="inline mr-1" /> : <FiToggleLeft className="inline mr-1" />}
                      {counter.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(counter._id || counter.id)} className="text-red-600 hover:text-red-900">
                      <FiTrash2 className="inline mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CounterSetup;