import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-trackerGreen">
          <Wallet size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-trackerRed p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
               <label className="block text-sm font-medium text-gray-700">Name</label>
               <input type="text" required value={name} onChange={(e) => setName(e.target.value)} 
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trackerGreen focus:border-trackerGreen sm:text-sm" />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Email address</label>
               <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trackerGreen focus:border-trackerGreen sm:text-sm" />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Password</label>
               <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-trackerGreen focus:border-trackerGreen sm:text-sm" />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-trackerGreen hover:bg-green-700 transition"
              >
                Sign up
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
             <Link to="/login" className="text-sm text-trackerGreen hover:text-green-800">
               Already have an account? Sign in
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
