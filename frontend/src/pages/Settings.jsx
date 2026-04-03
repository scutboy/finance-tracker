import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Download, Database, ShieldAlert } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and data.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
           <User className="text-gray-500" size={20} />
           <h3 className="text-lg font-bold text-gray-900">Account Information</h3>
         </div>
         <div className="p-6 space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
               <input type="text" defaultValue={user?.name || ''} className="w-full border-gray-300 rounded-md focus:ring-trackerBlue focus:border-trackerBlue sm:text-sm p-2 border" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
               <input type="email" disabled defaultValue={user?.email || ''} className="w-full border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm p-2 border cursor-not-allowed" />
             </div>
           </div>
           <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-sm text-sm font-medium">
             Save Changes
           </button>
         </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
           <Lock className="text-gray-500" size={20} />
           <h3 className="text-lg font-bold text-gray-900">Security</h3>
         </div>
         <div className="p-6 space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
               <input type="password" placeholder="••••••••" className="w-full border-gray-300 rounded-md focus:ring-trackerBlue focus:border-trackerBlue sm:text-sm p-2 border" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
               <input type="password" placeholder="••••••••" className="w-full border-gray-300 rounded-md focus:ring-trackerBlue focus:border-trackerBlue sm:text-sm p-2 border" />
             </div>
           </div>
           <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm text-sm font-medium">
             Update Password
           </button>
         </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
           <Database className="text-gray-500" size={20} />
           <h3 className="text-lg font-bold text-gray-900">Data Management</h3>
         </div>
         <div className="p-6 space-y-6">
           <div className="flex items-start justify-between">
              <div>
                 <h4 className="font-bold text-gray-900">Export Timeline Data</h4>
                 <p className="text-sm text-gray-500 mt-1">Download a JSON copy of all your tracked data.</p>
              </div>
              <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm text-sm font-medium">
                 <Download size={16} /> Export JSON
              </button>
           </div>
           <hr className="border-gray-100" />
           <div className="flex items-start justify-between">
              <div>
                 <h4 className="font-bold text-trackerRed flex items-center gap-2"><ShieldAlert size={18} /> Danger Zone</h4>
                 <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all financial data.</p>
              </div>
              <button onClick={() => {if(window.confirm('Are you strictly sure? All data will be destroyed.')){logout()}}} className="flex items-center gap-2 bg-red-50 text-trackerRed border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition shadow-sm text-sm font-medium">
                 Delete Account
              </button>
           </div>
         </div>
      </div>
    </div>
  );
};
export default Settings;
