import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import AlertMessage from '../../components/Common/AlertMessage';
import { receiptConfigAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ReceiptConfiguration = () => {
  const [config, setConfig] = useState({
    templeName: '',
    address: '',
    phone: '',
    gstin: '',
    receiptFooter: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load configuration on component mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const data = await receiptConfigAPI.getConfig();
      if (data.config) {
        setConfig(data.config);
      } else {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast.error('Failed to load receipt configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await receiptConfigAPI.updateConfig(config);
      setMessage('Receipt configuration saved successfully!');
      toast.success('Configuration saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save receipt configuration';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Receipt Configuration</h1>
        {message && <AlertMessage type="success" message={message} />}
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temple Name</label>
              <input
                type="text"
                name="templeName"
                value={config.templeName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={config.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={config.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
                <input
                  type="text"
                  name="gstin"
                  value={config.gstin}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Footer</label>
              <input
                type="text"
                name="receiptFooter"
                value={config.receiptFooter}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
  );
};

export default ReceiptConfiguration;
