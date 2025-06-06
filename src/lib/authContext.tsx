import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, checkEmailVerification } from '@/lib/firebase';
import { toast } from '@/components/ui/sonner';
import { ensureBusinessUserType } from './services/profileService';

interface UserProfile {
  userType: 'user' | 'business';
  businessName?: string;
  contactName?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  phoneVerified?: boolean;
  businessId?: string;
  businessType?: string;
  hasCompletedBusinessSetup?: boolean;
  role?: string;
  shopId?: string;
  shopName?: string;
}

interface AuthContextProps {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isBusiness: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  hasCompletedBusinessSetup: boolean;
  loading: boolean;
  refreshUser: () => void;
  refreshEmailVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  userProfile: null,
  isAuthenticated: false,
  isBusiness: false,
  isEmailVerified: false,
  isPhoneVerified: false,
  hasCompletedBusinessSetup: false,
  loading: true,
  refreshUser: () => { },
  refreshEmailVerification: async () => { },
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (user: User) => {
    try {
      console.log("Fetching user profile for:", user.uid);

      await user.getIdToken(true);
      const tokenResult = await user.getIdTokenResult();
      console.log("Custom claims:", tokenResult.claims);

      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const profileData = userDoc.data() as any;
        console.log("User profile data:", profileData);

        let userType = profileData.userType || 'user';

        if (tokenResult.claims.role === 'business_owner') {
          userType = 'business';
          console.log("Business owner detected from custom claims");
        } else if (profileData.role === 'business_owner') {
          userType = 'business';
          console.log("Business owner detected from profile data");
        } else if (profileData.role && profileData.role !== 'user') {
          userType = 'business';
          console.log("Non-user role detected:", profileData.role);
        }

        console.log("Final determined user type:", userType);

        const updatedProfile = {
          ...profileData,
          emailVerified: user.emailVerified,
          userType: userType as 'user' | 'business',
          businessName: tokenResult.claims.shopName || profileData.businessInfo?.shopName || profileData.businessName,
          businessId: tokenResult.claims.shopId || profileData.businessInfo?.shopId || profileData.businessId,
          role: tokenResult.claims.role || profileData.role,
          shopId: tokenResult.claims.shopId || profileData.businessInfo?.shopId,
          shopName: tokenResult.claims.shopName || profileData.businessInfo?.shopName
        };

        console.log("Setting user profile:", updatedProfile);
        setUserProfile(updatedProfile);

        setIsPhoneVerified(profileData.phoneVerified || false);
      } else {
        console.log("No user profile found, checking custom claims");

        let userType: 'user' | 'business' = 'user';
        if (tokenResult.claims.role === 'business_owner') {
          userType = 'business';
        }

        const defaultProfile = {
          userType,
          emailVerified: user.emailVerified,
          hasCompletedBusinessSetup: false,
          phoneVerified: false,
          businessName: tokenResult.claims.shopName,
          businessId: tokenResult.claims.shopId,
          role: tokenResult.claims.role,
          shopId: tokenResult.claims.shopId,
          shopName: tokenResult.claims.shopName
        };
        setUserProfile(defaultProfile);
        setIsPhoneVerified(false);
      }

      setIsEmailVerified(user.emailVerified);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      const errorProfile = {
        userType: 'user' as 'user' | 'business',
        emailVerified: false,
        hasCompletedBusinessSetup: false,
        phoneVerified: false
      };
      setUserProfile(errorProfile);
      setIsEmailVerified(false);
      setIsPhoneVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshEmailVerification = async () => {
    if (currentUser) {
      const verified = await checkEmailVerification();
      setIsEmailVerified(verified);

      if (userProfile) {
        setUserProfile({
          ...userProfile,
          emailVerified: verified
        });
      }
    }
  };

  useEffect(() => {
    console.log("AuthProvider initialized");

    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log("Auth state changed:", user?.uid);
        setCurrentUser(user);

        if (user) {
          setLoading(true);
          await fetchUserProfile(user);
        } else {
          setUserProfile(null);
          setIsEmailVerified(false);
          setIsPhoneVerified(false);
          setLoading(false);
        }
      });

      return () => {
        console.log("Cleaning up AuthProvider");
        unsubscribe();
      };
    } catch (error) {
      console.error("Auth listener setup error:", error);
      setLoading(false);
      return () => { };
    }
  }, []);

  const refreshUser = async () => {
    console.log("Refreshing user information");
    if (auth.currentUser) {
      await fetchUserProfile(auth.currentUser);
    }
  };

  const value = {
    currentUser,
    userProfile,
    isAuthenticated: !!currentUser,
    isBusiness: userProfile?.userType === 'business',
    isEmailVerified,
    isPhoneVerified,
    hasCompletedBusinessSetup: userProfile?.hasCompletedBusinessSetup || false,
    loading,
    refreshUser,
    refreshEmailVerification,
  };

  useEffect(() => {
    console.log("Auth Context State:", {
      isAuthenticated: !!currentUser,
      isBusiness: userProfile?.userType === 'business',
      userType: userProfile?.userType,
      loading
    });
  }, [currentUser, userProfile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
