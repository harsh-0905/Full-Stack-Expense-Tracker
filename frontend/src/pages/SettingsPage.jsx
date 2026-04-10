import { useState } from 'react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui';
import { Loader2, User, Wallet, Globe, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const CURRENCIES = [
  { code: 'INR', label: '₹ Indian Rupee' },
  { code: 'USD', label: '$ US Dollar'    },
  { code: 'EUR', label: '€ Euro'         },
  { code: 'GBP', label: '£ British Pound'},
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    name:          user?.name          || '',
    monthlyBudget: user?.monthlyBudget || 0,
    currency:      user?.currency      || 'INR',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm]     = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const setProfile_ = (field) => (e) =>
    setProfile((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-500">
            <User size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Profile</h3>
            <p className="text-xs text-[var(--color-muted)]">Update your personal details</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center
                            justify-center text-brand-600 dark:text-brand-300 text-xl font-extrabold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{user?.name}</p>
              <p className="text-xs text-[var(--color-muted)]">{user?.email}</p>
            </div>
          </div>

          <div>
            <label className="label">Full Name</label>
            <input className="input" value={profile.name} onChange={setProfile_('name')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1">
                <Wallet size={11} /> Monthly Budget
              </label>
              <input className="input" type="number" min="0" step="100"
                value={profile.monthlyBudget} onChange={setProfile_('monthlyBudget')} />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Shows a budget progress bar on your dashboard.
              </p>
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Globe size={11} /> Currency
              </label>
              <select className="input" value={profile.currency} onChange={setProfile_('currency')}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-1">
            <button type="submit" disabled={profileLoading} className="btn-primary">
              {profileLoading && <Loader2 size={15} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500">
            <Shield size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Account</h3>
            <p className="text-xs text-[var(--color-muted)]">Your account details</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <span className="text-[var(--color-muted)]">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <span className="text-[var(--color-muted)]">Member since</span>
            <span className="font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[var(--color-muted)]">Currency</span>
            <span className="font-medium">{profile.currency}</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-200 dark:border-red-900">
        <h3 className="font-bold text-sm text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
        <p className="text-sm text-[var(--color-muted)] mb-4">
          Once you delete your account, all your expenses and data will be permanently removed.
        </p>
        <button className="btn-danger opacity-60 cursor-not-allowed" disabled>
          Delete Account
        </button>
        <p className="text-xs text-[var(--color-muted)] mt-2">Contact support to delete your account.</p>
      </div>
    </div>
  );
}
