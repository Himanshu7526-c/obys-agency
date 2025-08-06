import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { fetchRewards, fetchActivities, redeemReward, completeActivity } from '../store/slices/rewardsSlice';
import { fetchPartners, fetchVouchers, createVoucher } from '../store/slices/otaSlice';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const MyRewards: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { rewards, activities, loading, error } = useSelector((state: RootState) => state.rewards);
  const { partners, vouchers } = useSelector((state: RootState) => state.ota);
  const [activeTab, setActiveTab] = useState<'rewards' | 'activities' | 'partners'>('rewards');
  const [selectedPartner, setSelectedPartner] = useState<string>('');

  useEffect(() => {
    dispatch(fetchRewards());
    dispatch(fetchActivities());
    dispatch(fetchPartners());
  }, [dispatch]);

  const handleRedeemReward = async (rewardId: string) => {
    try {
      await dispatch(redeemReward(rewardId));
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    try {
      await dispatch(completeActivity(activityId));
    } catch (error) {
      console.error('Failed to complete activity:', error);
    }
  };

  const handleCreateVoucher = async (partnerId: string) => {
    try {
      const voucherData = {
        amount: 10,
        currency: 'USD',
        description: 'Test voucher',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      await dispatch(createVoucher({ partnerId, voucherData }));
      dispatch(fetchVouchers(partnerId));
    } catch (error) {
      console.error('Failed to create voucher:', error);
    }
  };

  const handlePartnerSelect = (partnerId: string) => {
    setSelectedPartner(partnerId);
    dispatch(fetchVouchers(partnerId));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('common.myRewards')}</h1>
        <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        <div className="mt-4 p-4 bg-primary-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Points</p>
              <p className="text-2xl font-bold text-primary-600">{user?.points || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Earned</p>
              <p className="text-lg font-semibold text-gray-900">{user?.totalPointsEarned || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Redeemed</p>
              <p className="text-lg font-semibold text-gray-900">{user?.totalPointsRedeemed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`py-2 px-1 border-b-2 font-medium text-sm focus-ring ${
              activeTab === 'rewards'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('common.rewards')}
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-2 px-1 border-b-2 font-medium text-sm focus-ring ${
              activeTab === 'activities'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('common.activities')}
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`py-2 px-1 border-b-2 font-medium text-sm focus-ring ${
              activeTab === 'partners'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Partner Integrations
          </button>
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <div key={reward._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{reward.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  reward.status === 'active' ? 'bg-green-100 text-green-800' :
                  reward.status === 'redeemed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {reward.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{reward.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600">{reward.pointsValue} points</span>
                {reward.status === 'active' && (
                  <button
                    onClick={() => handleRedeemReward(reward._id)}
                    className="btn-primary"
                  >
                    {t('common.redeem')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <div key={activity._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  activity.status === 'available' ? 'bg-green-100 text-green-800' :
                  activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{activity.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600">{activity.pointsReward} points</span>
                {activity.status === 'available' && (
                  <button
                    onClick={() => handleCompleteActivity(activity._id)}
                    className="btn-primary"
                  >
                    {t('common.complete')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <div key={partner.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{partner.name}</h3>
                <p className="text-gray-600 mb-4">Type: {partner.type}</p>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Capabilities:</p>
                  <div className="flex flex-wrap gap-2">
                    {partner.capabilities.map((capability) => (
                      <span key={capability} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => handlePartnerSelect(partner.id)}
                    className="w-full btn-secondary"
                  >
                    View Vouchers
                  </button>
                  <button
                    onClick={() => handleCreateVoucher(partner.id)}
                    className="w-full btn-primary"
                  >
                    Create Voucher
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Partner Vouchers */}
          {selectedPartner && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Vouchers for {partners.find(p => p.id === selectedPartner)?.name}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vouchers.map((voucher) => (
                  <div key={voucher.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {voucher.code}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        voucher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {voucher.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{voucher.description}</p>
                    <p className="text-lg font-bold text-primary-600">
                      {voucher.amount} {voucher.currency}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyRewards;