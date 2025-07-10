import { useState } from 'react';
import axios from 'axios';
import './AddTask.css';



export default function AddTask({ onTaskCreated }) {
  const URI = import.meta.env.VITE_API_URL;
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleForm = () => setShowForm(!showForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${URI}/api/tasks`,
        { title, description, completed: false }, // Always send false for new tasks
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Task added successfully!');
      setTitle('');
      setDescription('');
      if (onTaskCreated) onTaskCreated(response.data);

      setTimeout(() => {
        setShowForm(false); // close after success
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task');
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center mt-4">
        <button className="btn btn-outline-primary" onClick={toggleForm}>
          ➕ Add Task
        </button>
      </div>

      {showForm && (
        <div className="task-form-overlay">
          <div className="task-form-container card shadow p-4">
            <button
              className="btn-close ms-auto"
              onClick={toggleForm}
              aria-label="Close"
            ></button>
            <h4 className="mb-3">New Task</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
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
                ></textarea>
              </div>
              <button type="submit" className="btn btn-dark w-100">
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}