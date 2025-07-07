import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const URI = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate(); // for redirecting

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${URI}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok && data.token) {
      // ✅ Store token
      localStorage.setItem('authToken', data.token);

      // ✅ Redirect to home page
      navigate('/Home');
    } else {
      console.error('Login failed:', data.message);
      alert(data.message || 'Login failed. Please try again.');
    }
  } catch (err) {
    console.error('Network error:', err);
    alert('Something went wrong. Please try again.');
  }
};


  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-light">Welcome Back</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control border-0 bg-light"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <input
                      type="password"
                      className="form-control border-0 bg-light"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                      />
                      <label className="form-check-label text-muted small" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="text-dark text-decoration-none small">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark w-100 py-2 mb-3"
                  >
                    Sign In
                  </button>
                </form>

                <div className="text-center">
                  <span className="text-muted small">Don't have an account? </span>
                  <Link to='/signup' className="text-dark text-decoration-none small">
                    Sign Up
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
