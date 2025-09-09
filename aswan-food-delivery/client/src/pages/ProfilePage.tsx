import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectUser,
  selectAuthLoading,
  updateProfile,
  changePassword,
} from '@/store/slices/authSlice';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  selectAddresses,
  selectUserLoading,
} from '@/store/slices/userSlice';
import { selectLanguage } from '@/store/slices/uiSlice';
import { User, Address } from '@/types';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiSave,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Validation schemas
const profileSchema = yup.object({
  firstName: yup.string().min(2, 'First name must be at least 2 characters').required('First name is required'),
  lastName: yup.string().min(2, 'Last name must be at least 2 characters').required('Last name is required'),
  phone: yup.string().matches(/^(\+20)?[0-9]{10,11}$/, 'Please enter a valid Egyptian phone number').optional(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match').required('Please confirm your password'),
});

const addressSchema = yup.object({
  title: yup.string().min(2, 'Title must be at least 2 characters').required('Title is required'),
  address: yup.string().min(10, 'Address must be at least 10 characters').required('Address is required'),
  city: yup.string().default('أسوان'),
  governorate: yup.string().default('أسوان'),
});

type ProfileFormData = {
  firstName: string;
  lastName: string;
  phone?: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type AddressFormData = {
  title: string;
  address: string;
  city: string;
  governorate: string;
};

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const addresses = useAppSelector(selectAddresses);
  const authLoading = useAppSelector(selectAuthLoading);
  const userLoading = useAppSelector(selectUserLoading);
  const language = useAppSelector(selectLanguage);

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'addresses'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const isArabic = language === 'ar';

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors },
    reset: resetAddress,
    setValue: setAddressValue,
  } = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      city: 'أسوان',
      governorate: 'أسوان',
    },
  });

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
      });
    }
  }, [user, resetProfile]);

  useEffect(() => {
    if (editingAddress) {
      setAddressValue('title', editingAddress.title);
      setAddressValue('address', editingAddress.address);
      setAddressValue('city', editingAddress.city);
      setAddressValue('governorate', editingAddress.governorate);
      setShowAddressForm(true);
    }
  }, [editingAddress, setAddressValue]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const result = await dispatch(updateProfile(data));
      if (updateProfile.fulfilled.match(result)) {
        toast.success(isArabic ? 'تم تحديث الملف الشخصي' : 'Profile updated successfully');
      } else {
        toast.error(result.payload || (isArabic ? 'فشل في تحديث الملف الشخصي' : 'Failed to update profile'));
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      const result = await dispatch(changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }));
      if (changePassword.fulfilled.match(result)) {
        toast.success(isArabic ? 'تم تغيير كلمة المرور' : 'Password changed successfully');
        resetPassword();
      } else {
        toast.error(result.payload || (isArabic ? 'فشل في تغيير كلمة المرور' : 'Failed to change password'));
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    }
  };

  const onAddressSubmit = async (data: AddressFormData) => {
    try {
      const addressData = {
        ...data,
        isDefault: addresses.length === 0, // First address is default
      };

      const result = editingAddress
        ? await dispatch(updateAddress({ id: editingAddress.id, data: addressData }))
        : await dispatch(addAddress(addressData));

      if ((editingAddress ? updateAddress.fulfilled : addAddress.fulfilled).match(result)) {
        toast.success(
          editingAddress
            ? (isArabic ? 'تم تحديث العنوان' : 'Address updated successfully')
            : (isArabic ? 'تم إضافة العنوان' : 'Address added successfully')
        );
        setShowAddressForm(false);
        setEditingAddress(null);
        resetAddress();
      } else {
        toast.error(
          result.payload || 
          (editingAddress 
            ? (isArabic ? 'فشل في تحديث العنوان' : 'Failed to update address')
            : (isArabic ? 'فشل في إضافة العنوان' : 'Failed to add address')
          )
        );
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذا العنوان؟' : 'Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const result = await dispatch(deleteAddress(addressId));
      if (deleteAddress.fulfilled.match(result)) {
        toast.success(isArabic ? 'تم حذف العنوان' : 'Address deleted successfully');
      } else {
        toast.error(result.payload || (isArabic ? 'فشل في حذف العنوان' : 'Failed to delete address'));
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const result = await dispatch(setDefaultAddress(addressId));
      if (setDefaultAddress.fulfilled.match(result)) {
        toast.success(isArabic ? 'تم تعيين العنوان الافتراضي' : 'Default address set successfully');
      } else {
        toast.error(result.payload || (isArabic ? 'فشل في تعيين العنوان الافتراضي' : 'Failed to set default address'));
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">
            {isArabic ? 'المستخدم غير موجود' : 'User not found'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-2">
            {isArabic ? 'الملف الشخصي' : 'Profile'}
          </h1>
          <p className="text-neutral-600">
            {isArabic ? 'إدارة معلوماتك الشخصية وإعداداتك' : 'Manage your personal information and settings'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
              {/* User Info */}
              <div className="text-center mb-6 pb-6 border-b border-neutral-200">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {user.firstName.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-neutral-800">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-neutral-500">{user.email}</p>
                {user.isVerified && (
                  <span className="inline-flex items-center space-x-1 rtl:space-x-reverse text-green-600 text-xs mt-2">
                    <FiCheck className="h-3 w-3" />
                    <span>{isArabic ? 'تم التحقق' : 'Verified'}</span>
                  </span>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { key: 'profile', icon: FiUser, label: isArabic ? 'المعلومات الشخصية' : 'Profile Info' },
                  { key: 'password', icon: FiEye, label: isArabic ? 'كلمة المرور' : 'Password' },
                  { key: 'addresses', icon: FiMapPin, label: isArabic ? 'العناوين' : 'Addresses' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key as any)}
                    className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg text-left rtl:text-right transition-colors ${
                      activeTab === item.key
                        ? 'bg-primary-100 text-primary-800'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-soft p-6"
              >
                <h2 className="text-xl font-semibold text-neutral-800 mb-6">
                  {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
                </h2>

                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        {isArabic ? 'الاسم الأول' : 'First Name'}
                      </label>
                      <div className="relative">
                        <FiUser className="absolute top-3 left-3 rtl:left-auto rtl:right-3 h-5 w-5 text-neutral-400" />
                        <input
                          {...registerProfile('firstName')}
                          type="text"
                          className={`input w-full pl-10 rtl:pl-3 rtl:pr-10 ${
                            profileErrors.firstName ? 'input-error' : ''
                          }`}
                        />
                      </div>
                      {profileErrors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.firstName.message}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        {isArabic ? 'اسم العائلة' : 'Last Name'}
                      </label>
                      <div className="relative">
                        <FiUser className="absolute top-3 left-3 rtl:left-auto rtl:right-3 h-5 w-5 text-neutral-400" />
                        <input
                          {...registerProfile('lastName')}
                          type="text"
                          className={`input w-full pl-10 rtl:pl-3 rtl:pr-10 ${
                            profileErrors.lastName ? 'input-error' : ''
                          }`}
                        />
                      </div>
                      {profileErrors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <FiMail className="absolute top-3 left-3 rtl:left-auto rtl:right-3 h-5 w-5 text-neutral-400" />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="input w-full pl-10 rtl:pl-3 rtl:pr-10 bg-neutral-50 text-neutral-500"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {isArabic ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute top-3 left-3 rtl:left-auto rtl:right-3 h-5 w-5 text-neutral-400" />
                      <input
                        {...registerProfile('phone')}
                        type="tel"
                        placeholder={isArabic ? '+20 123 456 7890' : '+20 123 456 7890'}
                        className={`input w-full pl-10 rtl:pl-3 rtl:pr-10 ${
                          profileErrors.phone ? 'input-error' : ''
                        }`}
                      />
                    </div>
                    {profileErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.phone.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn btn-primary flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
                  >
                    <FiSave className="h-4 w-4" />
                    <span>
                      {authLoading 
                        ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
                        : (isArabic ? 'حفظ التغييرات' : 'Save Changes')
                      }
                    </span>
                  </button>
                </form>
              </motion.div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-soft p-6"
              >
                <h2 className="text-xl font-semibold text-neutral-800 mb-6">
                  {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
                </h2>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {isArabic ? 'كلمة المرور الحالية' : 'Current Password'}
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('currentPassword')}
                        type={showPassword ? 'text' : 'password'}
                        className={`input w-full pr-10 rtl:pr-3 rtl:pl-10 ${
                          passwordErrors.currentPassword ? 'input-error' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('newPassword')}
                        type={showNewPassword ? 'text' : 'password'}
                        className={`input w-full pr-10 rtl:pr-3 rtl:pl-10 ${
                          passwordErrors.newPassword ? 'input-error' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-neutral-400 hover:text-neutral-600"
                      >
                        {showNewPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                    </label>
                    <input
                      {...registerPassword('confirmPassword')}
                      type="password"
                      className={`input w-full ${
                        passwordErrors.confirmPassword ? 'input-error' : ''
                      }`}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn btn-primary flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
                  >
                    <FiSave className="h-4 w-4" />
                    <span>
                      {authLoading 
                        ? (isArabic ? 'جاري التغيير...' : 'Changing...')
                        : (isArabic ? 'تغيير كلمة المرور' : 'Change Password')
                      }
                    </span>
                  </button>
                </form>
              </motion.div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-neutral-800">
                      {isArabic ? 'عناويني' : 'My Addresses'}
                    </h2>
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setShowAddressForm(true);
                        resetAddress();
                      }}
                      className="btn btn-primary btn-sm flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <FiPlus className="h-4 w-4" />
                      <span>{isArabic ? 'إضافة عنوان' : 'Add Address'}</span>
                    </button>
                  </div>

                  {/* Address Form */}
                  {showAddressForm && (
                    <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
                      <h3 className="font-medium text-neutral-800 mb-4">
                        {editingAddress 
                          ? (isArabic ? 'تعديل العنوان' : 'Edit Address')
                          : (isArabic ? 'إضافة عنوان جديد' : 'Add New Address')
                        }
                      </h3>

                      <form onSubmit={handleAddressSubmit(onAddressSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              {isArabic ? 'اسم العنوان' : 'Address Title'}
                            </label>
                            <input
                              {...registerAddress('title')}
                              placeholder={isArabic ? 'المنزل، العمل، إلخ' : 'Home, Work, etc'}
                              className={`input w-full ${addressErrors.title ? 'input-error' : ''}`}
                            />
                            {addressErrors.title && (
                              <p className="text-red-500 text-xs mt-1">{addressErrors.title.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              {isArabic ? 'المدينة' : 'City'}
                            </label>
                            <input
                              {...registerAddress('city')}
                              className="input w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            {isArabic ? 'العنوان التفصيلي' : 'Detailed Address'}
                          </label>
                          <textarea
                            {...registerAddress('address')}
                            rows={3}
                            placeholder={isArabic ? 'أدخل العنوان التفصيلي...' : 'Enter detailed address...'}
                            className={`input w-full resize-none ${addressErrors.address ? 'input-error' : ''}`}
                          />
                          {addressErrors.address && (
                            <p className="text-red-500 text-xs mt-1">{addressErrors.address.message}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <button
                            type="submit"
                            disabled={userLoading}
                            className="btn btn-primary btn-sm disabled:opacity-50"
                          >
                            {userLoading 
                              ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
                              : (editingAddress 
                                ? (isArabic ? 'تحديث' : 'Update')
                                : (isArabic ? 'إضافة' : 'Add')
                              )
                            }
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddress(null);
                              resetAddress();
                            }}
                            className="btn btn-outline btn-sm"
                          >
                            {isArabic ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Addresses List */}
                  {userLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-neutral-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
                              <FiMapPin className="h-5 w-5 text-neutral-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                                  <h4 className="font-medium text-neutral-800">{address.title}</h4>
                                  {address.isDefault && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                      {isArabic ? 'افتراضي' : 'Default'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-neutral-600 mb-1">{address.address}</p>
                                <p className="text-xs text-neutral-500">{address.city}, {address.governorate}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4 rtl:ml-0 rtl:mr-4">
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title={isArabic ? 'تعيين كافتراضي' : 'Set as default'}
                                >
                                  <FiCheck className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setEditingAddress(address)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={isArabic ? 'تعديل' : 'Edit'}
                              >
                                <FiEdit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title={isArabic ? 'حذف' : 'Delete'}
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiMapPin className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-600 mb-4">
                        {isArabic ? 'لا توجد عناوين محفوظة' : 'No saved addresses'}
                      </p>
                      <button
                        onClick={() => {
                          setShowAddressForm(true);
                          resetAddress();
                        }}
                        className="btn btn-primary"
                      >
                        {isArabic ? 'إضافة عنوان جديد' : 'Add New Address'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;