import { useEffect, useState, useRef } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { apiRequest } from "../../services/api"

const STATUS_OPTIONS = ['pending', 'contacted', 'done', 'spam'];

const AdminBulkPurchase = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const data = await apiRequest('/api/bulk-purchase', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(data);
    } catch (err) {
      setError('Failed to load bulk purchase requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await apiRequest(`/api/bulk-purchase/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { status },
      });
      setRequests((prev) => prev.map((req) => (req._id === id ? { ...req, status } : req)));
      if (selectedRequest && selectedRequest._id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bulk purchase request?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await apiRequest(`/api/bulk-purchase/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((req) => req._id !== id));
      if (isModalOpen) {
        closeModal();
      }
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    }
    if (openDropdownId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const openModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Bulk Purchase Inquiries</h1>
            <p className="text-gray-600 text-sm mt-1">Manage B2B bulk purchase requests from customers</p>
          </div>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-lime-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200">
            <p className="text-yellow-800 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
            <p className="text-blue-800 text-sm">Contacted</p>
            <p className="text-2xl font-bold text-blue-900">
              {requests.filter(r => r.status === 'contacted').length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
            <p className="text-green-800 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-900">
              {requests.filter(r => r.status === 'done').length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="mt-4 text-gray-500">No bulk purchase requests yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((req) => (
                      <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{req.name}</div>
                            {req.userId && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">User</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{req.company}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{req.email}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{req.phone}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {req.createdAt
                              ? new Date(req.createdAt).toLocaleString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <span
                              className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-colors
                                ${req.status === 'done' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                                ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                                ${req.status === 'contacted' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                                ${req.status === 'spam' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                              `}
                              style={{ textTransform: 'capitalize' }}
                              onClick={() => setOpenDropdownId(openDropdownId === req._id ? null : req._id)}
                            >
                              {req.status}
                            </span>
                            {openDropdownId === req._id && (
                              <div ref={dropdownRef} className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-32">
                                {STATUS_OPTIONS.map((status) => (
                                  <div
                                    key={status}
                                    className={`px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg
                                      ${req.status === status ? 'font-bold text-lime-600 bg-lime-50' : 'text-gray-700'}`}
                                    onClick={() => {
                                      updateStatus(req._id, status);
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 text-xs font-medium transition-colors"
                              onClick={() => openModal(req)}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal for Request Details */}
        {isModalOpen && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Bulk Purchase Request Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-700 block mb-2 text-sm">Full Name:</span>
                    <p className="text-gray-900">{selectedRequest.name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-700 block mb-2 text-sm">Company:</span>
                    <p className="text-gray-900">{selectedRequest.company}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-700 block mb-2 text-sm">Email:</span>
                    <p className="text-gray-900 break-all">{selectedRequest.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-700 block mb-2 text-sm">Phone Number:</span>
                    <p className="text-gray-900">{selectedRequest.phone}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-700 block mb-2 text-sm">Date:</span>
                    <p className="text-gray-900">
                      {selectedRequest.createdAt
                        ? new Date(selectedRequest.createdAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-700 block mb-2 text-sm">Status:</span>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedRequest._id, status)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                            ${selectedRequest.status === status 
                              ? status === 'done' ? 'bg-green-500 text-white ring-2 ring-green-600' 
                              : status === 'pending' ? 'bg-yellow-500 text-white ring-2 ring-yellow-600'
                              : status === 'contacted' ? 'bg-blue-500 text-white ring-2 ring-blue-600'
                              : 'bg-red-500 text-white ring-2 ring-red-600'
                              : status === 'done' ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : status === 'contacted' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }
                          `}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {selectedRequest.status === status && '✓ '}
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedRequest.userId && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <span className="font-medium text-blue-700 block mb-2 text-sm">Account Status:</span>
                      <p className="text-blue-900">✓ Registered User</p>
                    </div>
                  )}
                </div>
                {selectedRequest.note && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-700 block mb-2 text-sm">Additional Notes:</span>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {selectedRequest.note}
                    </p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
                <button
                  onClick={() => deleteRequest(selectedRequest._id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Request
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBulkPurchase;
