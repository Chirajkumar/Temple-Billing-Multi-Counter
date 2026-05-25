import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiEdit3 } from 'react-icons/fi';
import { usersAPI } from '../../services/api';
import { getCurrentUser } from '../../services/auth';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const ProfileModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      const data = await usersAPI.getProfile();
      setProfile(data);
      if (data) {
        setValue('name', data.name);
        setValue('email', data.email);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await usersAPI.updateProfile(data);
      toast.success('Profile updated successfully!');
      setEditing(false);
      loadProfile(); // Refresh
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Profile Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Avatar */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
              {profile.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{profile.name}</p>
              <p className="text-sm text-gray-500">{profile.role}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="flex items-center px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              <FiEdit3 className="mr-1 h-4 w-4" />
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
              <FiSave className="inline ml-2 h-4 w-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;

