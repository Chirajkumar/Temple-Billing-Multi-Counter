import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout/Layout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import AlertMessage from '../../components/Common/AlertMessage';
import DataTable from '../../components/Common/DataTable';
import { roomsAPI } from '../../services/api';

// New Booking Form Component
const NewBookingForm = ({ onClose, onSuccess, availableRooms }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    await onSuccess(data);
    reset();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Room *</label>
        <select
          {...register('roomId', { required: 'Please select a room' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Room</option>
          {availableRooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.id} - {room.type} (₹{room.price}/night)
            </option>
          ))}
        </select>
        {errors.roomId && <p className="text-red-500 text-xs mt-1">{errors.roomId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Devotee Name *</label>
        <input
          type="text"
          {...register('bookedBy', { required: 'Devotee name is required' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter devotee name"
        />
        {errors.bookedBy && <p className="text-red-500 text-xs mt-1">{errors.bookedBy.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
        <input
          type="tel"
          {...register('mobile', { required: 'Mobile number is required', pattern: /^[0-9]{10}$/ })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter 10-digit mobile number"
        />
        {errors.mobile && <p className="text-red-500 text-xs mt-1">Valid 10-digit mobile number required</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check In Date *</label>
          <input
            type="date"
            {...register('checkIn', { required: 'Check in date is required' })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.checkIn && <p className="text-red-500 text-xs mt-1">{errors.checkIn.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Date *</label>
          <input
            type="date"
            {...register('checkOut', { required: 'Check out date is required' })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.checkOut && <p className="text-red-500 text-xs mt-1">{errors.checkOut.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Persons</label>
        <input
          type="number"
          {...register('persons', { min: 1, max: 10 })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Number of persons"
          defaultValue={1}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
        <textarea
          {...register('specialRequests')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="2"
          placeholder="Any special requests or notes..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Confirm Booking
        </button>
      </div>
    </form>
  );
};

const RoomBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current bookings
        const bookingData = await roomsAPI.getBooking();
        setBookings(bookingData);

        // Fetch available rooms for booking
        const roomsData = await roomsAPI.getSetup();
        // Filter only active rooms
        const activeRooms = (roomsData || []).filter(room => room.status === 'Active');
        setAvailableRooms(activeRooms);

      } catch (error) {
        console.error('RoomBooking API error:', error);
        toast.error('Failed to load data');
        
        // Sample data for demonstration
        const sampleBookings = [
          { id: 'BK001', roomId: 'ROOM101', type: 'AC Single', price: 1500, status: 'Confirmed', bookedBy: 'Ramesh Sharma', mobile: '9876543210', checkIn: '2024-01-15', checkOut: '2024-01-17', persons: 1 },
          { id: 'BK002', roomId: 'ROOM102', type: 'AC Double', price: 2500, status: 'Checked In', bookedBy: 'Sita Patel', mobile: '9876543211', checkIn: '2024-01-14', checkOut: '2024-01-16', persons: 2 },
          { id: 'BK003', roomId: 'ROOM301', type: 'VIP Suite', price: 5000, status: 'Confirmed', bookedBy: 'Venkatesh Rao', mobile: '9876543212', checkIn: '2024-01-20', checkOut: '2024-01-22', persons: 4 },
        ];
        setBookings(sampleBookings);
        
        const sampleRooms = [
          { id: 'ROOM101', type: 'AC Single', price: 1500, status: 'Active' },
          { id: 'ROOM102', type: 'AC Double', price: 2500, status: 'Active' },
          { id: 'ROOM103', type: 'Non-AC Single', price: 800, status: 'Active' },
          { id: 'ROOM301', type: 'VIP Suite', price: 5000, status: 'Active' },
        ];
        setAvailableRooms(sampleRooms);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      'Confirmed': 'bg-green-100 text-green-800',
      'Checked In': 'bg-blue-100 text-blue-800',
      'Checked Out': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'id', header: 'Booking ID' },
    { key: 'roomId', header: 'Room No' },
    { key: 'type', header: 'Type' },
    { key: 'bookedBy', header: 'Devotee Name' },
    { key: 'mobile', header: 'Mobile' },
    { key: 'checkIn', header: 'Check In' },
    { key: 'checkOut', header: 'Check Out' },
    { 
      key: 'price', 
      header: 'Total Amount (₹)',
      render: (value, row) => {
        // Calculate nights and total amount
        if (row.checkIn && row.checkOut) {
          const nights = Math.ceil((new Date(row.checkOut) - new Date(row.checkIn)) / (1000 * 60 * 60 * 24));
          const total = nights * row.price;
          return `₹ ${total.toLocaleString()}`;
        }
        return `₹ ${value?.toLocaleString() || 0}`;
      }
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleCheckIn(row)}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Check In
          </button>
          <button 
            onClick={() => handleCheckOut(row)}
            className="text-orange-600 hover:text-orange-800 text-sm font-medium"
          >
            Check Out
          </button>
          <button 
            onClick={() => handleCancelBooking(row.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      )
    }
  ];

  const handleNewBookingClick = () => {
    setShowBookingModal(true);
  };

  const handleNewBooking = async (data) => {
    try {
      const selectedRoom = availableRooms.find(room => room.id === data.roomId);

      // Convert date inputs (YYYY-MM-DD) to a safe Date for backend validation
      const toDate = (d) => {
        // Treat as local date
        const [y, m, day] = String(d).split('-').map(Number);
        return new Date(y, m - 1, day);
      };

      const newBooking = {
        bookingId: `BK${String(bookings.length + 1).padStart(3, '0')}`,
        roomId: data.roomId,
        bookedBy: data.bookedBy,
        mobile: data.mobile,
        checkIn: toDate(data.checkIn),
        checkOut: toDate(data.checkOut),
        persons: data.persons || 1,
        specialRequests: data.specialRequests || '',
        type: selectedRoom?.type || '',
        price: selectedRoom?.price || 0,
        status: 'Confirmed'
      };

      await roomsAPI.createBooking(newBooking);

      // Refresh from backend so UI reflects real saved booking
      const bookingData = await roomsAPI.getBooking();
      setBookings(bookingData);

      const roomsData = await roomsAPI.getSetup();
      setAvailableRooms((roomsData || []).filter(room => room.status === 'Active'));

      toast.success(`Booking confirmed for ${data.bookedBy}`);
      setMessage(`Booking ${newBooking.bookingId} created successfully!`);
      setFormKey(prev => prev + 1);
    } catch (error) {
      console.error('RoomBooking add error:', error);
      const backendMsg = error?.response?.data?.message;
      toast.error(backendMsg || 'Failed to create booking');
      setMessage(backendMsg || 'Failed to create booking');
    }
  };

  const refreshBookings = async () => {
    const bookingData = await roomsAPI.getBooking();
    setBookings(bookingData);
  };

  const handleCheckIn = async (booking) => {
    if (booking.status !== 'Confirmed') {
      toast.error(`Cannot check in - Current status: ${booking.status}`);
      return;
    }

    try {
      await roomsAPI.updateBookingStatus(booking.id, 'Checked In');
      toast.success(`Checked in: ${booking.bookedBy}`);
      setMessage(`${booking.bookedBy} checked in successfully`);
      await refreshBookings();
    } catch (error) {
      const backendMsg = error?.response?.data?.message;
      toast.error(backendMsg || 'Failed to check in');
      setMessage(backendMsg || 'Failed to check in');
    }
  };

  const handleCheckOut = async (booking) => {
    if (booking.status !== 'Checked In') {
      toast.error(`Cannot check out - Current status: ${booking.status}`);
      return;
    }

    try {
      await roomsAPI.updateBookingStatus(booking.id, 'Checked Out');
      toast.success(`Checked out: ${booking.bookedBy}`);
      setMessage(`${booking.bookedBy} checked out successfully`);
      await refreshBookings();
    } catch (error) {
      const backendMsg = error?.response?.data?.message;
      toast.error(backendMsg || 'Failed to check out');
      setMessage(backendMsg || 'Failed to check out');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await roomsAPI.cancelBooking(bookingId);
      toast.success('Booking cancelled');
      setMessage('Booking cancelled successfully');
      await refreshBookings();
    } catch (error) {
      const backendMsg = error?.response?.data?.message;
      toast.error(backendMsg || 'Failed to cancel booking');
      setMessage(backendMsg || 'Failed to cancel booking');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Room Booking</h1>
        <button
          onClick={handleNewBookingClick}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition duration-200"
        >
          + New Booking
        </button>
      </div>
      
      {message && <AlertMessage type="success" message={message} onClose={() => setMessage('')} />}
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <DataTable 
            data={bookings} 
            columns={columns}
            searchPlaceholder="Search by room or devotee name..."
          />
          <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-500">
            Showing {bookings.length} of {bookings.length} bookings
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">New Room Booking</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              {availableRooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-red-500">No rooms available for booking.</p>
                  <p className="text-gray-500 text-sm mt-2">Please add rooms in Room Setup first.</p>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <NewBookingForm 
                  key={formKey}
                  onClose={() => setShowBookingModal(false)} 
                  onSuccess={handleNewBooking}
                  availableRooms={availableRooms}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBooking;