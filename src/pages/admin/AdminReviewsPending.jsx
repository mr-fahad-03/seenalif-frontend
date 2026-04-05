import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ReviewManagement from '../../components/admin/ReviewManagement';

const AdminReviewsPending = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <ReviewManagement defaultFilter="pending" />
      </div>
    </div>
  );
};

export default AdminReviewsPending;