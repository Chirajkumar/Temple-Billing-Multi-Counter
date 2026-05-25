import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { devoteesAPI } from '../../services/api.js';
import { ID_PROOF_TYPES } from '../../utils/constants';

const AddDevotee = () => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const selectedIdType = watch('idProofType');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const devoteeData = {
        name: data.fullName,
        mobile: data.mobile,
        address: `${data.address}, ${data.city}, ${data.state} - ${data.pinCode}`,
        email: data.email,
        gender: data.gender,
        age: data.age,
        idProofType: data.idProofType,
        idProofNumber: data.idProofNumber
      };
      
      await devoteesAPI.create(devoteeData);
      toast.success('Devotee registered successfully!');
      reset();
    } catch (error) {
      toast.error('Failed to register devotee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white">
          <h1 className="text-2xl font-bold text-gray-800">Register New Devotee</h1>
          <p className="text-gray-600 mt-1">Add devotee details for seva booking and donations</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devotee ID
              </label>
              <input
                type="text"
                value={`DEV${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                {...register('fullName', { required: 'Full name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                {...register('age', { required: 'Age is required', min: 0, max: 120 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                {...register('mobile', { required: 'Mobile number is required', pattern: /^[0-9]{10}$/ })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register('email', { pattern: /^\S+@\S+$/i })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                {...register('address', { required: 'Address is required' })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                {...register('city', { required: 'City is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                {...register('state', { required: 'State is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN Code *
              </label>
              <input
                type="text"
                {...register('pinCode', { required: 'PIN code is required', pattern: /^[0-9]{6}$/ })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Proof Type
              </label>
              <select
                {...register('idProofType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select ID Proof</option>
                {ID_PROOF_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Proof Number
              </label>
              <input
                type="text"
                {...register('idProofNumber', {
                  validate: (value) => {
                    if (!selectedIdType) return true;
                    const t = selectedIdType.toLowerCase();
                    if (t.includes('aadhaar') || t.includes('adhar')) {
                      return (/^[0-9]{12}$/).test(value) || 'Aadhaar must be 12 digits';
                    }
                    if (t.includes('voter')) {
                      return (/^[A-Z]{3}[0-9]{7}$/i).test(value) || 'Voter ID must be 10 chars (e.g., ABC1234567)';
                    }
                    return true;
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.idProofNumber && <p className="text-red-500 text-xs mt-1">{errors.idProofNumber.message}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Devotee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDevotee;

