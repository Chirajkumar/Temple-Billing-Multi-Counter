import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPrinter, FiPlus, FiTrash2 } from 'react-icons/fi';

const PrasadaBilling = () => {
  const { register, control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      items: [{ itemName: '', quantity: 1, rate: 0, total: 0 }]
    }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [billData, setBillData] = useState(null);

  const availableItems = [
    { id: 1, name: 'Laddu', price: 50 },
    { id: 2, name: 'Puliyodarai', price: 40 },
    { id: 3, name: 'Curd Rice', price: 35 },
    { id: 4, name: 'Vada', price: 20 },
    { id: 5, name: 'Sundal', price: 25 },
    { id: 6, name: 'Payasam', price: 60 }
  ];

  const watchItems = watch('items');
  
  const calculateTotal = () => {
    return watchItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const onItemSelect = (index, itemName) => {
    const selected = availableItems.find(item => item.name === itemName);
    if (selected) {
      setValue(`items.${index}.rate`, selected.price);
      setValue(`items.${index}.total`, selected.price * watchItems[index]?.quantity);
    }
  };

  const onQuantityChange = (index, quantity) => {
    const rate = watchItems[index]?.rate || 0;
    setValue(`items.${index}.total`, rate * quantity);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const bill = {
        billId: `BILL${Date.now()}`,
        receiptNumber: `PRCPT${Date.now()}`,
        ...data,
        totalAmount: calculateTotal(),
        date: new Date().toLocaleString()
      };
      setBillData(bill);
      setShowReceipt(true);
      toast.success('Bill generated successfully!');
    } catch (error) {
      toast.error('Failed to generate bill');
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
          <h1 className="text-2xl font-bold text-gray-800">Prasada Billing</h1>
          <p className="text-gray-600 mt-1">Generate bill for prasada items</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Devotee Name
            </label>
            <input
              type="text"
              {...register('devoteeName')}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              {...register('mobile')}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Items</h3>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <select
                      {...register(`items.${index}.itemName`, { required: true })}
                      onChange={(e) => onItemSelect(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Item</option>
                      {availableItems.map(item => (
                        <option key={item.id} value={item.name}>{item.name} - ₹{item.price}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                      onChange={(e) => onQuantityChange(index, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                    <input
                      type="number"
                      {...register(`items.${index}.rate`)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total (₹)</label>
                    <input
                      type="number"
                      {...register(`items.${index}.total`)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => append({ itemName: '', quantity: 1, rate: 0, total: 0 })}
              className="mt-3 text-orange-600 hover:text-orange-700 flex items-center"
            >
              <FiPlus className="mr-1" /> Add Item
            </button>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>₹{calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Mode *
            </label>
            <select
              {...register('paymentMode', { required: 'Payment mode is required' })}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Payment Mode</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              type="submit"
              disabled={loading || calculateTotal() === 0}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Generate Bill'}
            </button>
          </div>
        </form>
      </div>

      {/* Receipt Modal */}
      {showReceipt && billData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">Sri Temple</h2>
                <p className="text-sm text-gray-600">Prasada Sale Receipt</p>
              </div>

              <div className="space-y-2 py-4">
                <div className="flex justify-between">
                  <span className="font-medium">Bill No:</span>
                  <span>{billData.billId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{billData.date}</span>
                </div>
                {billData.devoteeName && (
                  <div className="flex justify-between">
                    <span className="font-medium">Devotee:</span>
                    <span>{billData.devoteeName}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Item</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-right py-1">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billData.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1">{item.itemName}</td>
                          <td className="text-center py-1">{item.quantity}</td>
                          <td className="text-right py-1">₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-bold">
                        <td colSpan="2" className="py-2">Total:</td>
                        <td className="text-right py-2">₹{billData.totalAmount}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Payment Mode:</span>
                  <span>{billData.paymentMode}</span>
                </div>
              </div>

              <div className="text-center border-t pt-4">
                <p className="text-sm text-gray-600">Thank you! Visit again</p>
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
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
              >
                <FiPrinter className="mr-2" /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrasadaBilling;