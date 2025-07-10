import { useEffect, useState } from 'react';
import axios from 'axios';
import EditTask from './EditTask';
import DeleteTask from './DeleteTask';



export default function TaskDetail({ taskId, onClose, onTaskUpdated, onTaskDeleted }) {
  const URI = import.meta.env.VITE_API_URL;
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${URI}/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTask(response.data);
      } catch (err) {
        setError('Failed to fetch task details');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [taskId]);

  const handleTaskUpdate = (updatedTask) => {
    setTask(updatedTask);
    onTaskUpdated?.(updatedTask);
    setIsEditing(false);
  };

  const handleTaskDelete = () => {
    onTaskDeleted?.(taskId); // Notify parent about deletion
    onClose?.(); // Close modal
  };

  if (!taskId) return null;

  if (isEditing && task) {
    return (
      <EditTask
        task={task}
        onClose={() => setIsEditing(false)}
        onTaskUpdated={handleTaskUpdate}
      />
    );
  }

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      role="dialog"
      onClick={onClose} // Close when clicking backdrop
    >
      <div 
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()} // Prevent modal content from closing
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{task?.title || 'Task Details'}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status" />
                <p>Loading task details...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <>
                <p className="mb-3">{task?.description || 'No description provided'}</p>
                <div className="mb-3">
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${task?.completed ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {task?.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <small className="text-muted">
                  Last updated: {task ? new Date(task.updatedAt).toLocaleString() : 'N/A'}
                </small>
              </>
            )}
          </div>
          <div className="modal-footer">
            {task && (
              <>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  Edit
                </button>
                <DeleteTask 
                  taskId={taskId} 
                  onDeleted={handleTaskDelete}
                />
              </>
            )}
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}