// EditTask.jsx
import { useState } from 'react';
import axios from 'axios';
import './AddTask.css';

const URI = import.meta.env.VITE_API_URL;

export default function EditTask({ task, onClose, onTaskUpdated }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [completed, setCompleted] = useState(task.completed);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `${URI}/api/tasks/update/${task._id}`,
        { title, description, completed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('Task updated successfully!');
      onTaskUpdated && onTaskUpdated(response.data);
      setTimeout(onClose, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-container card shadow p-4">
        <button className="btn-close ms-auto" onClick={onClose}></button>
        <h4 className="mb-3">Edit Task</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="editCheck"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="editCheck">
              Mark as Completed
            </label>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
