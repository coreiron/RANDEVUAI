import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, db, checkEmailVerification } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/sonner';
import { ensureBusinessUserType } from './services/profileService';
import { onAuthStateChanged } from 'firebase/auth';

interface UserProfile {
  userType: 'user' | 'business';
  businessName?: string;
  contactName?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  phoneVerified?: boolean;
  businessId?: string; // İşletme ID'si için alan eklendi
  // Business hesaplar için ilave bilgiler (isteğe bağlı)
  businessType?: string;
  hasCompletedBusinessSetup?: boolean; // İşletme bilgilerini tam olarak doldurmuş mu?
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

      // Get fresh token to access custom claims
      await user.getIdToken(true); // Force refresh token
      const tokenResult = await user.getIdTokenResult();
      console.log("Custom claims:", tokenResult.claims);

      let profileData = null;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          profileData = userDoc.data() as any;
          console.log("User profile data:", profileData);
        } else {
          console.log("No user profile found in Firestore");
        }
      } catch (firestoreError) {
        console.warn("Firestore user profile fetch failed:", firestoreError);
        // Firestore erişimi başarısız olursa custom claims'den devam et
        profileData = null;
      }

      if (profileData) {
        // role veya userType alanını kontrol et
        // business_owner role'ü varsa business olarak ayarla
        let userType = profileData.userType || 'user';

        // Custom claims'den role kontrol et
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
          // İşletme bilgilerini de ekle
          businessName: tokenResult.claims.shopName || profileData.businessInfo?.shopName || profileData.businessName,
          businessId: tokenResult.claims.shopId || profileData.businessInfo?.shopId || profileData.businessId,
          role: tokenResult.claims.role || profileData.role,
          shopId: tokenResult.claims.shopId || profileData.businessInfo?.shopId,
          shopName: tokenResult.claims.shopName || profileData.businessInfo?.shopName
        };

        console.log("Setting user profile:", updatedProfile);
        setUserProfile(updatedProfile);

        // Telefon doğrulama durumunu kontrol et
        setIsPhoneVerified(profileData.phoneVerified || false);
      } else {
        console.log("No user profile found, checking custom claims");

        // Firestore'da profil yoksa custom claims'den kontrol et
        let userType: 'user' | 'business' = 'user';
        if (tokenResult.claims.role === 'business_owner') {
          userType = 'business';
        }

        const defaultProfile = {
          userType,
          emailVerified: user.emailVerified,
          hasCompletedBusinessSetup: false,
          phoneVerified: false,
          businessName: tokenResult.claims.shopName as string,
          businessId: tokenResult.claims.shopId as string,
          role: tokenResult.claims.role as string,
          shopId: tokenResult.claims.shopId as string,
          shopName: tokenResult.claims.shopName as string
        };
        setUserProfile(defaultProfile);
        setIsPhoneVerified(false);
      }

      // Set email verification status
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
      // Listen for authentication state changes
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

      // Cleanup function
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

  // Refresh user information
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

  // Debug için değerleri logla
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
