import { useState, FormEvent } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/axiosClient';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { User as UserIcon, Mail, Calendar } from 'lucide-react';

/**
 * ProfilePage
 *
 * Allows the user to view account details, update name/email, and
 * change their password. Two separate forms with independent
 * loading/error state since they hit different endpoints.
 */
const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Please enter a valid email';
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setProfileLoading(true);
    try {
      const { data } = await authApi.updateProfile({ name, email });
      updateUser(data.data as typeof user & {});
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) errors.newPassword = 'New password is required';
    else if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    if (newPassword !== confirmNewPassword) errors.confirmNewPassword = 'Passwords do not match';
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPasswordLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information and security.</p>
      </div>

      {/* Account Info Card */}
      <Card className="p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="h-14 w-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <UserIcon size={14} />
            Role: <span className="font-medium text-gray-700 capitalize">{user?.role}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            Member since:{' '}
            <span className="font-medium text-gray-700">
              {user?.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '-'}
            </span>
          </div>
        </div>
      </Card>

      {/* Update Profile Form */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserIcon size={18} />
          Personal Information
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Full name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={profileErrors.name}
          />
          <Input
            label="Email address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={profileErrors.email}
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={profileLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Form */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail size={18} />
          Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current password"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={passwordErrors.currentPassword}
            autoComplete="current-password"
          />
          <Input
            label="New password"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={passwordErrors.newPassword}
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            name="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            error={passwordErrors.confirmNewPassword}
            autoComplete="new-password"
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={passwordLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
