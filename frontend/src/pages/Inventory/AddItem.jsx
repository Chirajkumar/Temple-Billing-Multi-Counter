import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { inventoryAPI } from '../../services/api';
import { INVENTORY_CATEGORIES } from '../../utils/constants';

const AddItem = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await inventoryAPI.getAll();
      setItems(data);
    } catch (error) {
      toast.error('Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await inventoryAPI.update(editingId, data);
        toast.success('Item updated successfully!');
      } else {
        await inventoryAPI.create(data);
        toast.success('Item added successfully!');
      }
      setEditingId(null);
      reset();
      fetchItems();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id || item.id);
    setValue('name', item.name);
    setValue('category', item.category);
    setValue('unit', item.unit);
    setValue('currentStock', item.currentStock);
    setValue('minStock', item.minStock);
    setValue('supplier', item.supplier);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryAPI.delete(id);
        toast.success('Item deleted successfully!');
        fetchItems();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white">
          <h1 className="text-2xl font-bold text-gray-800">
            {editingId ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </h1>
          <p className="text-gray-600 mt-1">Manage temple inventory items</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
              <input type="text" {...register('name', { required: 'Item name is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select {...register('category', { required: 'Category is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select Category</option>
                {INVENTORY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
              <select {...register('unit', { required: 'Unit is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select Unit</option>
                <option value="Nos">Nos</option><option value="Kg">Kg</option>
                <option value="Pack">Pack</option><option value="Liter">Liter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock *</label>
              <input type="number" {...register('currentStock', { required: 'Stock is required', min: 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stock Level *</label>
              <input type="number" {...register('minStock', { required: 'Min stock is required', min: 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
              <input type="text" {...register('supplier')} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            {editingId && <button type="button" onClick={() => { setEditingId(null); reset(); }} className="px-4 py-2 border rounded-md">Cancel</button>}
            <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">{editingId ? 'Update Item' : 'Add Item'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b"><h2 className="text-xl font-semibold">Inventory Items</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr><th className="px-6 py-3 text-left">Item</th><th className="px-6 py-3 text-left">Category</th><th className="px-6 py-3 text-left">Stock</th><th className="px-6 py-3 text-left">Min Stock</th><th className="px-6 py-3 text-left">Supplier</th><th className="px-6 py-3 text-left">Actions</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">{item.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.currentStock < item.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {item.currentStock} {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4">{item.minStock} {item.unit}</td>
                  <td className="px-6 py-4">{item.supplier || '-'}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600"><FiEdit2 className="inline mr-1" /> Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600"><FiTrash2 className="inline mr-1" /> Delete</button>
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

export default AddItem;