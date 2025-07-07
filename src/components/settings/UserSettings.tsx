import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { supabase } from '../../lib/supabase';
import { User, Mail, Shield, UserPlus, Trash2, Eye, EyeOff, Key, Settings, Users, Crown, UserCheck } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  role?: string;
}

export const UserSettings: React.FC = () => {
  const { user } = useDatabase();
  const { addToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Get current user profile
      if (user) {
        setUsers([{
          id: user.id,
          email: user.email || '',
          created_at: user.created_at || '',
          last_sign_in_at: user.last_sign_in_at || undefined,
          role: 'admin' // For now, all users are admins
        }]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      addToast('Failed to load user information', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      addToast('Please fill in all password fields', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        addToast(error.message, 'error');
      } else {
        addToast('Password updated successfully', 'success');
        setShowPasswordChange(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      addToast('Failed to change password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          updated_at: new Date().toISOString()
        }
      });

      if (error) {
        addToast(error.message, 'error');
      } else {
        addToast('Profile updated successfully', 'success');
        loadUsers();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Failed to update profile', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">User Management & RBAC</h2>
        <p className="text-gray-600 mb-6">
          Manage your account settings, security preferences, and role-based access control.
        </p>
      </div>

      {/* User Management Location Guide */}
      <Card title="Where to Manage Users">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <Users className="text-blue-500 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-2">User Management Locations</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>Current Page (Settings → User Management):</strong> Manage your personal account, password, and profile settings.</p>
                <p><strong>Supabase Dashboard:</strong> For advanced user management, visit your Supabase project dashboard → Authentication → Users to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Add new users and assign roles</li>
                  <li>Manage user permissions and access levels</li>
                  <li>View user activity and login history</li>
                  <li>Configure authentication providers</li>
                  <li>Set up email templates and policies</li>
                </ul>
                <p><strong>Application Level:</strong> Role-based access is enforced through Supabase RLS policies and user metadata.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* RBAC Information */}
      <Card title="Role-Based Access Control (RBAC)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Crown className="text-yellow-500 mr-2" size={18} />
              Available Roles
            </h4>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-100">
                <Shield className="text-red-600 mr-3" size={16} />
                <div>
                  <div className="font-medium text-red-800">Admin</div>
                  <div className="text-sm text-red-600">Full system access and management</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <UserCheck className="text-blue-600 mr-3" size={16} />
                <div>
                  <div className="font-medium text-blue-800">Manager</div>
                  <div className="text-sm text-blue-600">Department-level access and reporting</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <User className="text-green-600 mr-3" size={16} />
                <div>
                  <div className="font-medium text-green-800">Employee</div>
                  <div className="text-sm text-green-600">Limited self-service access</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Eye className="text-gray-600 mr-3" size={16} />
                <div>
                  <div className="font-medium text-gray-800">Viewer</div>
                  <div className="text-sm text-gray-600">Read-only access to reports</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Shield className="text-blue-500 mr-2" size={18} />
              Security Features
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Row-level security (RLS) policies</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Encrypted data transmission</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Secure cloud storage</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Audit trail for data changes</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Session management</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Password policies</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Current User Profile */}
      <div className="bg-gradient-to-r from-navy-50 to-teal-50 p-6 rounded-lg border border-navy-100">
        <div className="flex items-center mb-4">
          <div className="bg-navy-600 p-3 rounded-full text-white mr-4">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Your Account</h3>
            <p className="text-gray-600">Manage your personal account settings</p>
          </div>
        </div>

        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center p-3 bg-white rounded-md border border-gray-200">
                <Mail className="text-gray-400 mr-3" size={18} />
                <span className="text-gray-800">{user.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Created
              </label>
              <div className="flex items-center p-3 bg-white rounded-md border border-gray-200">
                <Settings className="text-gray-400 mr-3" size={18} />
                <span className="text-gray-800">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role
              </label>
              <div className="flex items-center p-3 bg-white rounded-md border border-gray-200">
                <Crown className="text-yellow-500 mr-3" size={18} />
                <span className="text-gray-800 font-medium">Administrator</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Sign In
              </label>
              <div className="flex items-center p-3 bg-white rounded-md border border-gray-200">
                <User className="text-gray-400 mr-3" size={18} />
                <span className="text-gray-800">
                  {user.last_sign_in_at 
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <Card title="Security Settings">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Key className="text-gray-500 mr-3" size={20} />
              <div>
                <h4 className="font-medium text-gray-800">Password</h4>
                <p className="text-sm text-gray-600">Change your account password</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              icon={showPasswordChange ? <EyeOff size={18} /> : <Eye size={18} />}
            >
              {showPasswordChange ? 'Cancel' : 'Change Password'}
            </Button>
          </div>

          {showPasswordChange && (
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-4">Change Password</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    placeholder="Enter new password"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handlePasswordChange}
                    isLoading={isChangingPassword}
                    icon={<Key size={18} />}
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Account Actions */}
      <Card title="Account Actions">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Settings className="text-blue-500 mr-3" size={20} />
              <div>
                <h4 className="font-medium text-gray-800">Update Profile</h4>
                <p className="text-sm text-gray-600">Refresh your profile information</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleUpdateProfile}
              icon={<Settings size={18} />}
            >
              Update Profile
            </Button>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="text-amber-500 mr-3 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-amber-800 mb-2">Security Notice</h4>
                <p className="text-sm text-amber-700">
                  Your account is secured with Supabase authentication. All data is encrypted and stored securely.
                  Make sure to use a strong password and keep your login credentials safe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* System Information */}
      <Card title="System Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Application Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="text-gray-800">2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database:</span>
                <span className="text-gray-800">Supabase PostgreSQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Authentication:</span>
                <span className="text-gray-800">Supabase Auth</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RBAC:</span>
                <span className="text-gray-800">Row Level Security</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-3">Features</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Real-time attendance tracking</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Overtime calculation</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Advanced analytics</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Data export/import</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Role-based access control</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Legacy data migration</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};