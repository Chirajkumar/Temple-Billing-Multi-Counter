import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPrinter, FiSearch } from 'react-icons/fi';

const SevaBooking = () => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const sevas = [
    { id: 1, name: 'Maha Abhishekam', price: 2500, duration: 60, maxDevotees: 5 },
    { id: 2, name: 'Rudra Homam', price: 3500, duration: 90, maxDevotees: 10 },
    { id: 3, name: 'Archana', price: 500, duration: 30, maxDevotees: 1 },
    { id: 4, name: 'Sahasranamam', price: 1000, duration: 45, maxDevotees: 3 },
    { id: 5, name: 'Kalasa Puja', price: 1500, duration: 60, maxDevotees: 4 }
  ];

  const timeSlots = ['06:00 AM', '08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'];

  const selectedSevaId = watch('sevaId');
  const numberOfPersons = watch('numberOfPersons') || 1;
  const selectedSeva = sevas.find(s => s.id === parseInt(selectedSevaId));
  
  const totalAmount = selectedSeva ? selectedSeva.price * numberOfPersons : 0;
  const discount = totalAmount > 5000 ? totalAmount * 0.1 : (totalAmount > 3000 ? totalAmount * 0.05 : 0);
  const finalAmount = totalAmount - discount;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const booking = {
        bookingId: `BK${Date.now()}`,
        receiptNumber: `RCPT${Date.now()}`,
        ...data,
        sevaName: selectedSeva?.name,
        sevaPrice: selectedSeva?.price,
        totalAmount,
        discount,
        finalAmount,
        bookingDate: new Date().toLocaleString()
      };
      setBookingData(booking);
      setShowReceipt(true);
      toast.success('Seva booked successfully!');
    } catch (error) {
      toast.error('Failed to book seva');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSearchDevotee = async () => {
    // Simulate searching for devotee
    const mobile = watch('mobile');
    if (mobile && mobile.length === 10) {
      setValue('devoteeName', 'Ramesh Kumar');
      setValue('email', 'ramesh@example.com');
      toast.success('Devotee found!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white">
          <h1 className="text-2xl font-bold text-gray-800">Seva Booking</h1>
          <p className="text-gray-600 mt-1">Book various sevas for devotees</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Devotee Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Devotee Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    {...register('mobile', { required: 'Mobile number is required', pattern: /^[0-9]{10}$/ })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="10-digit mobile number"
                  />
                  <button
                    type="button"
                    onClick={handleSearchDevotee}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    <FiSearch className="inline mr-1" /> Search
                  </button>
                </div>
                {errors.mobile && <p className="text-red-500 text-xs mt-1">Valid 10-digit mobile number required</p>}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  {...register('address')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Right Column - Seva Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Seva Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Seva *
                </label>
                <select
                  {...register('sevaId', { required: 'Please select a seva' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Seva</option>
                  {sevas.map(seva => (
                    <option key={seva.id} value={seva.id}>
                      {seva.name} - ₹{seva.price} ({seva.duration} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Date *
                </label>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot *
                </label>
                <select
                  {...register('timeSlot', { required: 'Time slot is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Time Slot</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Persons *
                </label>
                <input
                  type="number"
                  {...register('numberOfPersons', { required: 'Number of persons is required', min: 1, max: selectedSeva?.maxDevotees || 10 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {selectedSeva && (
                  <p className="text-xs text-gray-500 mt-1">Max allowed: {selectedSeva.maxDevotees} persons</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  {...register('specialNotes')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Any special requirements..."
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {selectedSeva && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Seva Amount (₹{selectedSeva.price} x {numberOfPersons})</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({totalAmount > 5000 ? '10%' : '5%'})</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Amount</span>
                  <span>₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode *
                </label>
                <select
                  {...register('paymentMode', { required: 'Payment mode is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID (if online payment)
                </label>
                <input
                  type="text"
                  {...register('transactionId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading || !selectedSeva}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Book Seva & Generate Receipt'}
            </button>
          </div>
        </form>
      </div>

      {/* Receipt Modal */}
      {showReceipt && bookingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 print:p-0">
              {/* Receipt Content */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">Sri Temple</h2>
                <p className="text-sm text-gray-600">Temple Road, City - 123456</p>
                <p className="text-sm text-gray-600">Phone: +91 9876543210</p>
                <h3 className="text-lg font-semibold mt-2">Seva Booking Receipt</h3>
              </div>

              <div className="space-y-2 py-4">
                <div className="flex justify-between">
                  <span className="font-medium">Receipt No:</span>
                  <span>{bookingData.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Booking ID:</span>
                  <span>{bookingData.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{bookingData.bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Devotee Name:</span>
                  <span>{bookingData.devoteeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Mobile:</span>
                  <span>{bookingData.mobile}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Seva:</span>
                    <span>{bookingData.sevaName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date & Time:</span>
                    <span>{bookingData.date} - {bookingData.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Persons:</span>
                    <span>{bookingData.numberOfPersons}</span>
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>₹{bookingData.totalAmount}</span>
                  </div>
                  {bookingData.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{bookingData.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg mt-1">
                    <span>Total Paid:</span>
                    <span>₹{bookingData.finalAmount}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Payment Mode:</span>
                    <span>{bookingData.paymentMode}</span>
                  </div>
                </div>
              </div>

              <div className="text-center border-t pt-4">
                <p className="text-sm text-gray-600">Thank you for your patronage!</p>
                <p className="text-xs text-gray-500 mt-1">This is a computer generated receipt</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t print:hidden">
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
                <FiPrinter className="mr-2" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SevaBooking;