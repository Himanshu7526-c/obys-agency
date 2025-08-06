import React from 'react';
import { useSelector } from 'react-redux';
import { Gift, ShoppingCart, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Continue your journey and earn more rewards
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{user?.points || 0}</p>
              <p className="text-gray-600">Total Points</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-secondary-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{user?.level || 1}</p>
              <p className="text-gray-600">Current Level</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center">
            <Gift className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{user?.rewards?.length || 0}</p>
              <p className="text-gray-600">Rewards Earned</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{user?.completedTasks?.length || 0}</p>
              <p className="text-gray-600">Tasks Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/rewards" className="block">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-md p-6 text-white hover:from-primary-600 hover:to-primary-700 transition-all">
            <div className="flex items-center">
              <Gift className="w-12 h-12" />
              <div className="ml-4">
                <h3 className="text-xl font-semibold">My Rewards</h3>
                <p className="text-primary-100">View and redeem your rewards</p>
              </div>
            </div>
          </div>
        </Link>
        
        <Link to="/store" className="block">
          <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-md p-6 text-white hover:from-secondary-600 hover:to-secondary-700 transition-all">
            <div className="flex items-center">
              <ShoppingCart className="w-12 h-12" />
              <div className="ml-4">
                <h3 className="text-xl font-semibold">Add-On Store</h3>
                <p className="text-secondary-100">Browse premium add-ons</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;