import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, googleAuthProvider, db } from './firebase';
import { UserProfile } from '../types';
import { LocalStorageService } from './localStorageService';

export interface AuthStateListener {
  (user: UserProfile | null, rawFirebaseUser: FirebaseUser | null): void;
}

export class AuthenticationService {
  private static listeners: AuthStateListener[] = [];
  private static currentUserProfile: UserProfile | null = null;
  private static rawUser: FirebaseUser | null = null;
  private static isInitialized = false;

  static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Restore cached session immediately
    const cachedProfile = LocalStorageService.getCachedUserProfile();
    if (cachedProfile) {
      this.currentUserProfile = cachedProfile;
      this.notifyListeners(cachedProfile, null);
    }

    onAuthStateChanged(auth, async (firebaseUser) => {
      this.rawUser = firebaseUser;
      if (firebaseUser) {
        const profile = await this.fetchOrCreateUserProfile(firebaseUser);
        this.currentUserProfile = profile;
        LocalStorageService.saveCachedUserProfile(profile);
        this.notifyListeners(profile, firebaseUser);
      } else {
        // If logged in via demo or phone simulator, preserve session unless explicitly signed out
        const activeCached = LocalStorageService.getCachedUserProfile();
        if (activeCached && (activeCached.userId.startsWith('torvex_demo_') || activeCached.userId.startsWith('phone_user_'))) {
          this.currentUserProfile = activeCached;
          this.notifyListeners(activeCached, null);
        } else {
          this.currentUserProfile = null;
          LocalStorageService.clearCachedUserProfile();
          this.notifyListeners(null, null);
        }
      }
    });
  }

  static onAuthStateChange(listener: AuthStateListener) {
    this.listeners.push(listener);
    // Send immediate current state if already resolved
    if (this.isInitialized) {
      listener(this.currentUserProfile, this.rawUser);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(profile: UserProfile | null, rawUser: FirebaseUser | null) {
    for (const listener of this.listeners) {
      listener(profile, rawUser);
    }
  }

  static getCurrentUser(): UserProfile | null {
    return this.currentUserProfile;
  }

  static getRawFirebaseUser(): FirebaseUser | null {
    return this.rawUser;
  }

  /**
   * Fetch user document from users/{userId}, or initialize with 0 statistics (Strict Data Integrity rule)
   */
  static async fetchOrCreateUserProfile(user: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null }): Promise<UserProfile> {
    const userRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userRef);
      const now = new Date().toISOString();

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // Update last active
        await updateDoc(userRef, { lastActiveAt: now }).catch(() => {});
        return {
          ...data,
          lastActiveAt: now,
          userId: user.uid,
          emailAddress: user.email || data.emailAddress || '',
          displayName: user.displayName || data.displayName || 'Torvex Athlete',
          profileImageUrl: user.photoURL || data.profileImageUrl || '',
        };
      } else {
        // Strict Data Integrity for new users: All statistics start at 0
        const newProfile: UserProfile = {
          userId: user.uid,
          displayName: user.displayName || 'Torvex Athlete',
          emailAddress: user.email || '',
          profileImageUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          createdAt: now,
          updatedAt: now,
          lastActiveAt: now,
          currentStreak: 0,
          longestStreak: 0,
          totalWorkoutCount: 0,
          totalWorkoutMinutes: 0,
          totalCaloriesBurned: 0,
          fitnessGoal: 'Build Muscle',
          fitnessLevel: 'Intermediate',
          preferredDaysPerWeek: 4
        };

        await setDoc(userRef, newProfile);
        return newProfile;
      }
    } catch (error) {
      console.warn('Firestore user fetch failed, creating local fallback profile:', error);
      const now = new Date().toISOString();
      return {
        userId: user.uid,
        displayName: user.displayName || 'Torvex Athlete',
        emailAddress: user.email || 'athlete@torvex.com',
        profileImageUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        createdAt: now,
        updatedAt: now,
        lastActiveAt: now,
        currentStreak: 0,
        longestStreak: 0,
        totalWorkoutCount: 0,
        totalWorkoutMinutes: 0,
        totalCaloriesBurned: 0,
        fitnessGoal: 'Build Muscle',
        fitnessLevel: 'Intermediate',
        preferredDaysPerWeek: 4
      };
    }
  }

  // Google Sign-In with Firebase Auth
  static async signInWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const profile = await this.fetchOrCreateUserProfile(result.user);
      this.currentUserProfile = profile;
      this.rawUser = result.user;
      this.notifyListeners(profile, result.user);
      return profile;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // Email & Password Registration
  static async registerWithEmail(name: string, email: string, pass: string): Promise<UserProfile> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      const profile = await this.fetchOrCreateUserProfile({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name || cred.user.displayName,
        photoURL: cred.user.photoURL
      });
      this.currentUserProfile = profile;
      this.rawUser = cred.user;
      this.notifyListeners(profile, cred.user);
      return profile;
    } catch (error: any) {
      console.error('Email registration error:', error);
      throw error;
    }
  }

  // Email & Password Login
  static async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await this.fetchOrCreateUserProfile(cred.user);
      this.currentUserProfile = profile;
      this.rawUser = cred.user;
      this.notifyListeners(profile, cred.user);
      return profile;
    } catch (error: any) {
      console.error('Email login error:', error);
      throw error;
    }
  }

  // Password reset
  static async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  // Phone OTP Simulator / Development flow
  static async simulatePhoneOtpVerification(phoneNumber: string, code: string): Promise<UserProfile> {
    if (code !== '123456' && code !== '000000') {
      throw new Error('Invalid verification code. Use development test code: 123456');
    }
    const syntheticUid = 'phone_user_' + phoneNumber.replace(/\D/g, '').slice(-8);
    const profile = await this.fetchOrCreateUserProfile({
      uid: syntheticUid,
      email: `${syntheticUid}@torvex.app`,
      displayName: `Athlete (${phoneNumber.slice(-4)})`,
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    });
    this.currentUserProfile = profile;
    LocalStorageService.saveCachedUserProfile(profile);
    this.notifyListeners(profile, null);
    return profile;
  }

  // Quick Demo Guest Sign-In for QA & Sandbox testing
  static async signInAsDemoAthlete(): Promise<UserProfile> {
    const demoUid = 'torvex_demo_athlete_01';
    const profile = await this.fetchOrCreateUserProfile({
      uid: demoUid,
      email: 'alex.vance@torvex.com',
      displayName: 'Alex Vance',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    });
    this.currentUserProfile = profile;
    LocalStorageService.saveCachedUserProfile(profile);
    this.notifyListeners(profile, null);
    return profile;
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignored
    }
    this.currentUserProfile = null;
    this.rawUser = null;
    LocalStorageService.clearCachedUserProfile();
    this.notifyListeners(null, null);
  }

  // Update profile data
  static async updateProfileData(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUserProfile) throw new Error('No authenticated user');
    const userRef = doc(db, 'users', this.currentUserProfile.userId);
    const updated = {
      ...this.currentUserProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(userRef, updates).catch(e => {
      console.warn('Could not sync profile update to firestore:', e);
    });
    this.currentUserProfile = updated;
    this.notifyListeners(updated, this.rawUser);
    return updated;
  }

  // Permanently delete user document and all associated data (Apple Guideline 5.1.1(v) compliance)
  static async deleteUserData(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef).catch(() => {});
      
      // If signed in with Firebase Auth, attempt delete user
      if (auth.currentUser && auth.currentUser.uid === userId) {
        await auth.currentUser.delete().catch(() => {});
      }
    } catch (e) {
      console.warn('Firestore delete user operation encountered an issue:', e);
    }
    
    this.currentUserProfile = null;
    this.rawUser = null;
    LocalStorageService.clearCachedUserProfile();
    this.notifyListeners(null, null);
  }
}
