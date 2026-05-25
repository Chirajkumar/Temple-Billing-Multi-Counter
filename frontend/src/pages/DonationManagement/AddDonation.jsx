import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPrinter } from 'react-icons/fi';
import { donationsAPI } from '../../services/api.js';
import { DONATION_TYPES, PAYMENT_MODES } from '../../utils/constants';

const AddDonation = () => {
  const initialId = `DON${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({ defaultValues: { receiptNumber: initialId } });
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [donationData, setDonationData] = useState(null);
  const [generatedId, setGeneratedId] = useState(initialId);

const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Validate required fields
      if (!data.amount || !data.donationType || !data.paymentMode) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const donationData = {
        amount: parseFloat(data.amount),
        type: data.donationType,
        paymentMode: data.paymentMode,
        devoteeName: data.devoteeName,
        mobile: data.mobile,
        donationDate: new Date(data.donationDate),
        receiptNo: data.receiptNumber || generatedId,
        description: data.address || '',
        status: 'completed'
      };

      await donationsAPI.create(donationData);
      setDonationData({ ...data, donationId: generatedId });
      setShowReceipt(true);
      toast.success('Donation recorded successfully!');
      // prepare new id for next donation
      const newId = `DON${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      setGeneratedId(newId);
      reset({ receiptNumber: newId });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to record donation';
      toast.error(errorMessage);
      console.error('Donation creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white">
          <h1 className="text-2xl font-bold text-gray-800">Record Donation</h1>
          <p className="text-gray-600 mt-1">Accept and manage donations from devotees</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation ID
              </label>
              <input
                type="text"
                value={generatedId}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Number *
              </label>
              <input
                type="text"
                {...register('receiptNumber', { required: 'Receipt number is required' })}
                defaultValue={generatedId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              />
              {errors.receiptNumber && <p className="text-red-500 text-xs mt-1">{errors.receiptNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devotee Name *
              </label>
              <input
                type="text"
                {...register('devoteeName', { required: 'Devotee name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.devoteeName && <p className="text-red-500 text-xs mt-1">{errors.devoteeName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                {...register('mobile', { required: 'Mobile number is required', pattern: { value: /^[0-9]{10}$/, message: 'Enter valid 10-digit mobile number' } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="10-digit mobile number"
              />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Date *
              </label>
              <input
                type="date"
                {...register('donationDate', { required: 'Donation date is required' })}
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.donationDate && <p className="text-red-500 text-xs mt-1">{errors.donationDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Type *
              </label>
              <select
                {...register('donationType', { required: 'Donation type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Donation Type</option>
                {DONATION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹) *
              </label>
              <input
                type="number"
                {...register('amount', { required: 'Amount is required', min: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Mode *
              </label>
              <select
                {...register('paymentMode', { required: 'Payment mode is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Payment Mode</option>
                {PAYMENT_MODES.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID
              </label>
              <input
                type="text"
                {...register('transactionId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="For online payments"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number (Optional)
              </label>
              <input
                type="text"
                {...register('panNumber', { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="ABCDE1234F"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                {...register('address')}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Full address"
              />
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
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Record Donation'}
            </button>
          </div>
        </form>
      </div>

      {showReceipt && donationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">Sri Temple</h2>
                <p className="text-sm text-gray-600">Temple Road, City - 123456</p>
                <h3 className="text-lg font-semibold mt-2">Donation Receipt</h3>
              </div>

              <div className="space-y-2 py-4">
                <div className="flex justify-between">
                  <span className="font-medium">Receipt No:</span>
                  <span>{donationData.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Donation ID:</span>
                  <span>{donationData.donationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{donationData.donationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Devotee Name:</span>
                  <span>{donationData.devoteeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Donation Type:</span>
                  <span>{donationData.donationType}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Amount:</span>
                    <span>₹{parseInt(donationData.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Payment Mode:</span>
                    <span>{donationData.paymentMode}</span>
                  </div>
                  {donationData.transactionId && (
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span>{donationData.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center border-t pt-4">
                <p className="text-sm text-gray-600">Thank you for your generous donation!</p>
                <p className="text-xs text-gray-500 mt-1">May God bless you!</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t">
              <button
                onClick={() => setShowReceipt(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <FiPrinter className="mr-2" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDonation;