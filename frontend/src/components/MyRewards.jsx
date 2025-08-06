import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Gift, Calendar, CheckCircle, ExternalLink, Filter, Loader2 } from 'lucide-react';
import { fetchVouchers, createVoucher, checkVoucherStatus } from '../store/slices/partnersSlice';
import { updateUserPoints } from '../store/slices/authSlice';
import { showToast } from '../store/slices/uiSlice';

const MyRewards = () => {
  const dispatch = useDispatch();
  const { vouchers, userVouchers, loading } = useSelector(state => state.partners);
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('available');
  const [filters, setFilters] = useState({
    category: '',
    partnerId: '',
    maxPoints: user?.points || 1000
  });

  useEffect(() => {
    dispatch(fetchVouchers(filters));
  }, [dispatch, filters]);

  const handleRedeemVoucher = async (voucher) => {
    if (user.points < voucher.pointsCost) {
      dispatch(showToast({
        message: 'Insufficient points to redeem this voucher',
        type: 'error'
      }));
      return;
    }

    try {
      const result = await dispatch(createVoucher({
        voucherId: voucher.id,
        userPoints: user.points
      })).unwrap();

      dispatch(updateUserPoints({
        points: user.points - voucher.pointsCost,
        level: user.level
      }));

      dispatch(showToast({
        message: 'Voucher redeemed successfully!',
        type: 'success'
      }));
    } catch (error) {
      dispatch(showToast({
        message: error || 'Failed to redeem voucher',
        type: 'error'
      }));
    }
  };

  const handleCheckStatus = async (voucherId) => {
    try {
      await dispatch(checkVoucherStatus(voucherId)).unwrap();
      dispatch(showToast({
        message: 'Voucher status updated',
        type: 'success'
      }));
    } catch (error) {
      dispatch(showToast({
        message: 'Failed to check voucher status',
        type: 'error'
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const VoucherCard = ({ voucher, isUserVoucher = false }) => (
    <div className="bg-white rounded-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={voucher.partner?.logo || voucher.image}
            alt={voucher.partner?.name || voucher.title}
            className="w-12 h-12 object-contain rounded-md"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{voucher.title}</h3>
            <p className="text-sm text-gray-600">{voucher.partner?.name}</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          {voucher.category}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4">{voucher.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${voucher.value?.amount || voucher.template?.value?.amount}
            </span>
            <span className="text-sm text-gray-500 ml-1">value</span>
          </div>
          {!isUserVoucher && (
            <div>
              <span className="text-lg font-semibold text-primary-600">
                {voucher.pointsCost}
              </span>
              <span className="text-sm text-gray-500 ml-1">points</span>
            </div>
          )}
        </div>
      </div>

      {isUserVoucher ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Code:</span>
            <span className="font-mono font-semibold">{voucher.code}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Expires:</span>
            <span className="text-gray-900">{formatDate(voucher.expiresAt)}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleCheckStatus(voucher.id)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Check Status
            </button>
            {voucher.redemptionUrl && (
              <a
                href={voucher.redemptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Redeem
              </a>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => handleRedeemVoucher(voucher)}
          disabled={loading.creating || user.points < voucher.pointsCost}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            user.points < voucher.pointsCost
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
          }`}
        >
          {loading.creating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Redeeming...
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              {user.points < voucher.pointsCost ? 'Insufficient Points' : 'Redeem Voucher'}
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Rewards & Redemptions</h1>
        <p className="text-gray-600">
          Redeem your points for amazing rewards from our partners
        </p>
      </div>

      {/* User Points Display */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-md p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Your Points Balance</h2>
            <p className="text-3xl font-bold">{user?.points || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-primary-100">Level {user?.level || 1}</p>
            <p className="text-sm text-primary-200">
              {Math.max(0, (user?.level || 1) * 100 - (user?.points || 0))} points to next level
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Rewards
          </button>
          <button
            onClick={() => setActiveTab('my-vouchers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-vouchers'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Vouchers ({userVouchers.length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'available' && (
        <div className="bg-gray-50 rounded-md p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              <option value="dining">Dining</option>
              <option value="shopping">Shopping</option>
              <option value="travel">Travel</option>
              <option value="entertainment">Entertainment</option>
            </select>
            <input
              type="range"
              min="0"
              max={user?.points || 1000}
              value={filters.maxPoints}
              onChange={(e) => setFilters({ ...filters, maxPoints: e.target.value })}
              className="flex-1"
            />
            <span className="text-sm text-gray-600">Max: {filters.maxPoints} points</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'available' ? (
          loading.vouchers ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : vouchers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rewards available</h3>
              <p className="text-gray-600">Check back later for new rewards!</p>
            </div>
          ) : (
            vouchers.map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))
          )
        ) : userVouchers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vouchers yet</h3>
            <p className="text-gray-600">Redeem some rewards to see them here!</p>
          </div>
        ) : (
          userVouchers.map((voucher) => (
            <VoucherCard key={voucher.id} voucher={voucher} isUserVoucher />
          ))
        )}
      </div>
    </div>
  );
};

export default MyRewards;