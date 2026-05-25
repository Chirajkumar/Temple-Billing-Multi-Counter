import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import DataTable from '../../components/Common/DataTable';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { festivalAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FestivalManagement = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFestival, setEditingFestival] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    specialSevas: '',
    description: '',
    pricing: '',
    status: 'Upcoming'
  });

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      const data = await festivalAPI.getAll();
      setFestivals(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch festivals');
      // Fallback to localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const savedFestivals = localStorage.getItem('temple_festivals');
    if (savedFestivals) {
      setFestivals(JSON.parse(savedFestivals));
    } else {
      // Sample data for testing
      const sampleFestivals = [
        { 
          id: 'FST001', 
          name: 'Brahmotsavam', 
          startDate: '2024-09-28', 
          endDate: '2024-10-08', 
          specialSevas: 'Kalyanam, Rathotsavam, Vahanam',
          description: 'Annual 10-day festival celebrating Lord Venkateswara',
          pricing: 'Special Seva tickets starting from ₹500',
          status: 'Upcoming'
        },
        { 
          id: 'FST002', 
          name: 'Vaikunta Ekadasi', 
          startDate: '2024-12-21', 
          endDate: '2024-12-21', 
          specialSevas: 'Vaikunta Dwaram, Special Pujas',
          description: 'Most auspicious day to visit the temple',
          pricing: 'Free darshan, Special ticket ₹300',
          status: 'Upcoming'
        },
        { 
          id: 'FST003', 
          name: 'Sri Rama Navami', 
          startDate: '2024-04-17', 
          endDate: '2024-04-17', 
          specialSevas: 'Rama Pattabhishekam, Hanuman Puja',
          description: 'Celebrating the birth of Lord Rama',
          pricing: 'General ₹100, Special ₹500',
          status: 'Completed'
        },
        { 
          id: 'FST004', 
          name: 'Vinayaka Chaturthi', 
          startDate: '2024-09-07', 
          endDate: '2024-09-10', 
          specialSevas: 'Modak Puja, Ganapati Homam',
          description: '3-day Ganesh festival',
          pricing: 'Puja ticket ₹200',
          status: 'Ongoing'
        },
        { 
          id: 'FST005', 
          name: 'Deepavali', 
          startDate: '2024-10-31', 
          endDate: '2024-11-01', 
          specialSevas: 'Lakshmi Puja, Fireworks, Annadanam',
          description: 'Festival of lights celebration',
          pricing: 'Free entry, Special Puja ₹1000',
          status: 'Upcoming'
        },
      ];
      setFestivals(sampleFestivals);
      localStorage.setItem('temple_festivals', JSON.stringify(sampleFestivals));
    }
  };

  const saveToLocalStorage = (updatedFestivals) => {
    localStorage.setItem('temple_festivals', JSON.stringify(updatedFestivals));
  };

  const handleAddFestival = async (e) => {
    e.preventDefault();
    try {
      const newFestival = {
        id: `FST${String(festivals.length + 1).padStart(3, '0')}`,
        ...formData,
        createdAt: new Date().toISOString()
      };
      
      const updatedFestivals = [...festivals, newFestival];
      setFestivals(updatedFestivals);
      saveToLocalStorage(updatedFestivals);
      toast.success('Festival added successfully!');
      setShowAddModal(false);
      resetForm();
      
      // Try API if available
      if (festivalAPI.create) {
        await festivalAPI.create(newFestival);
      }
    } catch (error) {
      console.error('Add error:', error);
      toast.error('Failed to add festival');
    }
  };

  const handleEditFestival = async (e) => {
    e.preventDefault();
    try {
      const updatedFestivals = festivals.map(f => 
        f.id === editingFestival.id ? { ...f, ...formData } : f
      );
      setFestivals(updatedFestivals);
      saveToLocalStorage(updatedFestivals);
      toast.success('Festival updated successfully!');
      setEditingFestival(null);
      resetForm();
      
      if (festivalAPI.update) {
        await festivalAPI.update(editingFestival.id, formData);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update festival');
    }
  };

  const handleDeleteFestival = async (id) => {
    if (window.confirm('Are you sure you want to delete this festival?')) {
      try {
        const updatedFestivals = festivals.filter(f => f.id !== id);
        setFestivals(updatedFestivals);
        saveToLocalStorage(updatedFestivals);
        toast.success('Festival deleted successfully!');
        
        if (festivalAPI.delete) {
          await festivalAPI.delete(id);
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete festival');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      specialSevas: '',
      description: '',
      pricing: '',
      status: 'Upcoming'
    });
  };

  const openEditModal = (festival) => {
    setEditingFestival(festival);
    setFormData({
      name: festival.name,
      startDate: festival.startDate,
      endDate: festival.endDate,
      specialSevas: festival.specialSevas,
      description: festival.description || '',
      pricing: festival.pricing || '',
      status: festival.status
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Upcoming': 'bg-blue-100 text-blue-800',
      'Ongoing': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Custom table rendering function
  const renderTable = () => {
    if (festivals.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No festivals</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new festival.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Festival
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Festival Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Sevas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {festivals.map((festival) => {
              // Calculate duration
              const start = new Date(festival.startDate);
              const end = new Date(festival.endDate);
              const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
              const duration = durationDays === 1 ? '1 day' : `${durationDays} days`;

              return (
                <tr key={festival.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{festival.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{festival.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(festival.startDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(festival.endDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{duration}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={festival.specialSevas}>
                    {festival.specialSevas}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{festival.pricing || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(festival.status)}`}>
                      {festival.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(festival)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFestival(festival.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Festival Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage temple festivals, special events, and seva bookings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Festival
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {renderTable()}
          {festivals.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-500">
              Showing {festivals.length} of {festivals.length} festivals
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingFestival) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingFestival ? 'Edit Festival' : 'Add New Festival'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingFestival(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={editingFestival ? handleEditFestival : handleAddFestival}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Festival Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter festival name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Sevas</label>
                    <input
                      type="text"
                      value={formData.specialSevas}
                      onChange={(e) => setFormData({...formData, specialSevas: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Kalyanam, Rathotsavam, Vahanam"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple sevas with commas</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the festival and its significance..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Information</label>
                    <input
                      type="text"
                      value={formData.pricing}
                      onChange={(e) => setFormData({...formData, pricing: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Free entry, Special ticket ₹500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingFestival(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    {editingFestival ? 'Update Festival' : 'Add Festival'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FestivalManagement;