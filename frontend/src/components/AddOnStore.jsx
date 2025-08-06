import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Zap, Star, Clock, TrendingUp, Filter, Loader2, CreditCard } from 'lucide-react';
import { fetchAddons, purchaseAddon } from '../store/slices/addonsSlice';
import { showToast } from '../store/slices/uiSlice';

const AddOnStore = () => {
  const dispatch = useDispatch();
  const { addons, purchases, loading } = useSelector(state => state.addons);
  const { user } = useSelector(state => state.auth);
  const [filters, setFilters] = useState({
    type: '',
    maxPrice: ''
  });
  const [selectedAddon, setSelectedAddon] = useState(null);

  useEffect(() => {
    dispatch(fetchAddons(filters));
  }, [dispatch, filters]);

  const handlePurchase = async (addon) => {
    try {
      // In a real implementation, you would integrate with Stripe here
      const result = await dispatch(purchaseAddon({
        addonId: addon.id,
        paymentMethodId: 'pm_mock_stripe_payment_method'
      })).unwrap();

      dispatch(showToast({
        message: 'Add-on purchased successfully!',
        type: 'success'
      }));

      setSelectedAddon(null);
    } catch (error) {
      dispatch(showToast({
        message: error || 'Failed to purchase add-on',
        type: 'error'
      }));
    }
  };

  const getAddonIcon = (type) => {
    switch (type) {
      case 'boost':
        return <Zap className="w-6 h-6" />;
      case 'content':
        return <Star className="w-6 h-6" />;
      case 'progression':
        return <TrendingUp className="w-6 h-6" />;
      default:
        return <ShoppingCart className="w-6 h-6" />;
    }
  };

  const getAddonBadgeColor = (type) => {
    switch (type) {
      case 'boost':
        return 'bg-green-100 text-green-800';
      case 'content':
        return 'bg-blue-100 text-blue-800';
      case 'progression':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const AddonCard = ({ addon }) => (
    <div className="bg-white rounded-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-md">
            {getAddonIcon(addon.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{addon.title}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAddonBadgeColor(addon.type)}`}>
              {addon.type}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">
            ${addon.price.amount}
          </span>
          <p className="text-sm text-gray-500">{addon.price.currency}</p>
        </div>
      </div>

      <div className="mb-4">
        <img
          src={addon.image}
          alt={addon.title}
          className="w-full h-32 object-cover rounded-md mb-3"
        />
        <p className="text-gray-600 text-sm">{addon.description}</p>
      </div>

      {/* Add-on specific details */}
      <div className="space-y-2 mb-4 text-sm">
        {addon.duration && (
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            Duration: {addon.duration} days
          </div>
        )}
        {addon.multiplier && (
          <div className="flex items-center text-green-600">
            <Zap className="w-4 h-4 mr-2" />
            {addon.multiplier}x points multiplier
          </div>
        )}
        {addon.taskCount && (
          <div className="flex items-center text-blue-600">
            <Star className="w-4 h-4 mr-2" />
            {addon.taskCount} exclusive tasks
          </div>
        )}
        {addon.levelBoost && (
          <div className="flex items-center text-purple-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            +{addon.levelBoost} level boost
          </div>
        )}
      </div>

      <button
        onClick={() => setSelectedAddon(addon)}
        disabled={loading.purchasing}
        className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading.purchasing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Purchase Now
          </>
        )}
      </button>
    </div>
  );

  const PurchaseModal = ({ addon, onClose, onConfirm }) => {
    if (!addon) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Purchase</h3>
          
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-md">
                {getAddonIcon(addon.type)}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{addon.title}</h4>
                <p className="text-sm text-gray-600">{addon.description}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className="text-xl font-bold text-gray-900">
                  ${addon.price.amount} {addon.price.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Mock payment form */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">**** **** **** 4242</span>
              <span className="text-xs text-gray-500 ml-auto">Visa</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This is a test environment. No real charges will be made.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(addon)}
              disabled={loading.purchasing}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading.purchasing ? 'Processing...' : 'Confirm Purchase'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add-On Store</h1>
        <p className="text-gray-600">
          Boost your experience with premium add-ons and exclusive content
        </p>
      </div>

      {/* User Stats */}
      <div className="bg-white rounded-md border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{user?.points || 0}</div>
            <div className="text-sm text-gray-600">Current Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-600">{user?.level || 1}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{purchases.length}</div>
            <div className="text-sm text-gray-600">Add-ons Purchased</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="form-select rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="boost">Point Boosts</option>
            <option value="content">Content Packs</option>
            <option value="progression">Progression</option>
          </select>
          <select
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="form-select rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Any Price</option>
            <option value="5">Under $5</option>
            <option value="10">Under $10</option>
            <option value="20">Under $20</option>
          </select>
        </div>
      </div>

      {/* Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading.addons ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : addons.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No add-ons available</h3>
            <p className="text-gray-600">Check back later for new add-ons!</p>
          </div>
        ) : (
          addons.map((addon) => (
            <AddonCard key={addon.id} addon={addon} />
          ))
        )}
      </div>

      {/* Recent Purchases */}
      {purchases.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Purchases</h2>
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500">
                <div>Add-on</div>
                <div>Price</div>
                <div>Status</div>
                <div>Purchase Date</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {purchases.slice(0, 5).map((purchase) => (
                <div key={purchase.id} className="px-6 py-4">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="flex items-center space-x-3">
                      <div className="p-1 bg-gray-100 rounded">
                        {getAddonIcon(purchase.addon.type)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{purchase.addon.title}</div>
                        <div className="text-sm text-gray-600">{purchase.addon.type}</div>
                      </div>
                    </div>
                    <div className="font-medium text-gray-900">
                      ${purchase.amount} {purchase.currency}
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {purchase.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(purchase.purchasedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        addon={selectedAddon}
        onClose={() => setSelectedAddon(null)}
        onConfirm={handlePurchase}
      />
    </div>
  );
};

export default AddOnStore;