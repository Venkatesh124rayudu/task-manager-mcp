import { useState, useEffect } from 'react';
import axios from 'axios';
import FetchTask from './FetchTask';
import AddTask from './AddTask';
import './Home.css';

const URI = import.meta.env.VITE_API_URL;

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${URI}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Tasks</h2>
        <AddTask onTaskCreated={handleAddTask} />
      </div>
      <FetchTask tasks={tasks} loading={loading} error={error} />
    </div>
  );
}
