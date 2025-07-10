import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskDetail from './TaskDetail';


export default function FetchTask({ tasks: initialTasks, loading, error }) {
  const URI = import.meta.env.VITE_API_URL;
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskList, setTaskList] = useState(initialTasks);

  useEffect(() => {
    setTaskList(initialTasks);
  }, [initialTasks]);

  const handleCloseModal = () => setSelectedTaskId(null);

  const handleTaskUpdated = (updatedTask) => {
    const updatedList = taskList.map(task =>
      task._id === updatedTask._id ? updatedTask : task
    );
    setTaskList(updatedList);
  };

  const handleTaskDeleted = (deletedTaskId) => {
    const updatedList = taskList.filter(task => task._id !== deletedTaskId);
    setTaskList(updatedList);
    setSelectedTaskId(null);
  };

  // Function to toggle completed status
  const handleCheckboxChange = async (task) => {
    const updatedCompletedStatus = !task.completed;

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `${URI}/api/tasks/update/${task._id}`,
        { completed: updatedCompletedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Optimistically update UI
      const updatedList = taskList.map(t =>
        t._id === task._id ? response.data : t
      );
      setTaskList(updatedList);
    } catch (err) {
      console.error('Failed to update task:', err);
      alert('Failed to update task status');
    }
  };

  return (
    <div className="mt-4">
      {/* Loading State */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : taskList.length === 0 ? (
        <div className="alert alert-info text-center">No tasks found.</div>
      ) : (
        <>
          {/* Task List */}
          {taskList.map((task) => (
            <div className="card mb-3 shadow-sm" key={task._id}>
              <div className="card-body d-flex align-items-center justify-content-between">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleCheckboxChange(task)}
                  className="form-check-input me-3"
                />

                {/* Flex container for title, description, date */}
                <div className="d-flex flex-fill justify-content-between align-items-center gap-3">
                  {/* Title - Left-aligned */}
                  <div className="flex-grow-1 text-start">
                    <h5
                      className={`mb-0 ${
                        task.completed ? 'text-decoration-line-through text-muted' : ''
                      }`}
                      style={{ fontWeight: '600', fontSize: '1.1rem' }}
                    >
                      {task.title}
                    </h5>
                  </div>

                  {/* Description - Center-aligned */}
                  <div className="flex-grow-1 text-center">
                    <p
                      className={`mb-0 small ${
                        task.completed ? 'text-decoration-line-through text-muted' : ''
                      }`}
                    >
                      {task.description}
                    </p>
                  </div>

                  {/* Date - Right-aligned */}
                  <div className="flex-grow-1 text-end">
                    <small className="text-muted">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  className="btn btn-outline-primary btn-sm ms-3"
                  onClick={() => setSelectedTaskId(task._id)}
                >
                  View
                </button>
              </div>
            </div>
          ))}

          {/* Modal for task details */}
          {selectedTaskId && (
            <TaskDetail
              taskId={selectedTaskId}
              onClose={handleCloseModal}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          )}
        </>
      )}
    </div>
  );
}