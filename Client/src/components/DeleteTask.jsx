import axios from 'axios';
import { useState } from 'react';

const URI = import.meta.env.VITE_API_URL;

export default function DeleteTask({ taskId, onDeleted}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('authToken');
      await axios.delete(`${URI}/api/tasks/delete/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onDeleted?.(); // Notify parent of successful deletion
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (confirmed) handleDelete();
  };

  return (
    <button 
      className="btn btn-danger" 
      onClick={confirmDelete}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}