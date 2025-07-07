// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from './components/SignUp';
import LoginPage from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/Home" element={<Home/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
