"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Search, Eye, Mail, RefreshCw, Package } from "lucide-react"
import { useToast } from "../../context/ToastContext"

import config from "../../config/config"
const ReceivedOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)
  const { showToast } = useToast()

  const formatPrice = (price) => {
    return `AED ${price.toLocaleString()}`
  }

  const handleSendNotification = async (orderId) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await axios.post(
        `${config.API_URL}/api/admin/orders/${orderId}/notify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      showToast("Notification sent successfully!", "success")
      setProcessingAction(false)
    } catch (error) {
      console.error("Error sending notification:", error)
      showToast("Failed to send notification", "error")
      setProcessingAction(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // Set up real-time polling every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("Authentication token not found. Please login again.")
        return
      }

      const { data } = await axios.get(`${config.API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Filter for received orders (new orders that need processing)
      const receivedOrders = data.filter(
        (order) =>
          order.status === "Processing" ||
          order.status === "Received" ||
          new Date(order.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000), // Orders from last 24 hours
      )

      setOrders(receivedOrders)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to load orders. Please try again later.")
      setLoading(false)
    }
  }

  const handleConfirmOrder = async (orderId) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await axios.put(
        `${config.API_URL}/api/admin/orders/${orderId}/status`,
        { status: "Confirmed" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      // Update order in state
      setOrders(orders.map((order) => (order._id === orderId ? { ...order, status: "Confirmed" } : order)))
      showToast("Order confirmed successfully!", "success")
      setProcessingAction(false)
    } catch (error) {
      console.error("Error confirming order:", error)
      showToast("Failed to confirm order", "error")
      setProcessingAction(false)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
  }

  const handleCloseModal = () => {
    setSelectedOrder(null)
  }

  const filteredOrders = orders.filter(
    (order) =>
      order._id.includes(searchTerm) ||
      order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Received Orders</h1>
            <p className="text-gray-600 mt-1">New orders that need confirmation and processing</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

        <div className="mb-6 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-96 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            Pending Orders: <span className="font-semibold text-orange-600">{filteredOrders.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Received Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">#{order._id.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.deliveryType === 'pickup' ? (
                          <>
                            <div className="text-sm text-gray-900">{order.pickupDetails?.location || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{order.pickupDetails?.phone || 'N/A'}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm text-gray-900">{order.shippingAddress?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{order.shippingAddress?.email || 'N/A'}</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.orderItems.length} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleConfirmOrder(order._id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          disabled={processingAction}
                          title="Confirm Order"
                        >
                          <Package size={18} />
                        </button>
                        <button
                          onClick={() => handleSendNotification(order._id)}
                          className="text-purple-600 hover:text-purple-900"
                          disabled={processingAction}
                          title="Send Notification"
                        >
                          <Mail size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No received orders found</div>
            <p className="text-gray-400 mt-2">New orders will appear here when customers place orders</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder._id.slice(-6)}</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500 text-2xl">
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
                  {selectedOrder.deliveryType === 'pickup' ? (
                    <>
                      <p className="text-gray-600">
                        <span className="font-medium">Name:</span> {selectedOrder.pickupDetails?.location || 'N/A'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Phone:</span> {selectedOrder.pickupDetails?.phone || 'N/A'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600">
                        <span className="font-medium">Name:</span> {selectedOrder.shippingAddress?.name || 'N/A'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Email:</span> {selectedOrder.shippingAddress?.email || 'N/A'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Phone:</span> {selectedOrder.shippingAddress?.phone || 'N/A'}
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Order Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleConfirmOrder(selectedOrder._id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                      disabled={processingAction}
                    >
                      <Package size={18} className="mr-2" />
                      Confirm Order
                    </button>
                    <button
                      onClick={() => handleSendNotification(selectedOrder._id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                      disabled={processingAction}
                    >
                      <Mail size={18} className="mr-2" />
                      Send Notification
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReceivedOrders
