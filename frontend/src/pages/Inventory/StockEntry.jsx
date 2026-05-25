import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

const StockEntry = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [entries, setEntries] = useState([]);

  const items = ['Coconut', 'Camphor', 'Flowers', 'Milk', 'Curd', 'Ghee', 'Fruits'];

  const onSubmit = (data) => {
    const newEntry = { id: entries.length + 1, ...data, date: new Date().toLocaleString() };
    setEntries([newEntry, ...entries]);
    toast.success('Stock entry added successfully!');
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white">
          <h1 className="text-2xl font-bold text-gray-800">Stock Entry</h1>
          <p className="text-gray-600 mt-1">Add new stock to inventory</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
              <select {...register('itemName', { required: 'Item is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select Item</option>
                {items.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Added *</label>
              <input type="number" {...register('quantity', { required: 'Quantity is required', min: 1 })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
              <input type="text" {...register('supplier')} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost (₹)</label>
              <input type="number" {...register('cost')} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center">
              <FiPlus className="mr-2" /> Add Stock Entry
            </button>
          </div>
        </form>
      </div>

      {entries.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b"><h2 className="text-xl font-semibold">Recent Stock Entries</h2></div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr><th className="px-6 py-3 text-left">Date</th><th className="px-6 py-3 text-left">Item</th><th className="px-6 py-3 text-left">Quantity</th><th className="px-6 py-3 text-left">Supplier</th><th className="px-6 py-3 text-left">Cost</th></tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{entry.date}</td>
                    <td className="px-6 py-4 text-sm">{entry.itemName}</td>
                    <td className="px-6 py-4 text-sm">{entry.quantity}</td>
                    <td className="px-6 py-4 text-sm">{entry.supplier || '-'}</td>
                    <td className="px-6 py-4 text-sm">{entry.cost ? `₹${entry.cost}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockEntry;