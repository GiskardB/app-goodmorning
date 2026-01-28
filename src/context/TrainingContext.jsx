import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getUserProfile,
  saveUserProfile,
  isOnboardingCompleted,
  resetOnboarding,
  saveSession,
  getSessions,
  getRecentSessions,
  addPainEvent,
  getRecentPainEvents,
  addAntiPattern,
  getActiveAntiPatterns,
  getTrainingStats,
  getAllProfiles,
  createProfile,
  switchProfile,
  deleteProfile,
  getActiveProfileId
} from '../db';
import { calculateReadinessScore, calculateProgressionDecision } from '../utils/calculations';

const TrainingContext = createContext(null);

export function TrainingProvider({ children }) {
  // User profile state
  const [userProfile, setUserProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Session state
  const [currentSession, setCurrentSession] = useState(null);
  const [preWorkoutData, setPreWorkoutData] = useState(null);
  const [postWorkoutData, setPostWorkoutData] = useState(null);
  const [readinessScore, setReadinessScore] = useState(null);

  // History and stats
  const [recentSessions, setRecentSessions] = useState([]);
  const [trainingStats, setTrainingStats] = useState(null);
  const [activeAntiPatterns, setActiveAntiPatterns] = useState([]);

  // UI state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPreWorkout, setShowPreWorkout] = useState(false);
  const [showPostWorkout, setShowPostWorkout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Load all profiles
        const profiles = await getAllProfiles();
        setAllProfiles(profiles);

        // Get active profile ID
        const activeId = await getActiveProfileId();
        setActiveProfileId(activeId);

        const profile = await getUserProfile();
        setUserProfile(profile);

        const completed = await isOnboardingCompleted();
        setOnboardingCompleted(completed);
        setShowOnboarding(!completed);

        if (completed) {
          // Load additional data only if onboarding is done
          const sessions = await getRecentSessions(7);
          setRecentSessions(sessions);

          const stats = await getTrainingStats();
          setTrainingStats(stats);

          const patterns = await getActiveAntiPatterns();
          setActiveAntiPatterns(patterns);
        }
      } catch (error) {
        console.error('Error loading training data:', error);
      } finally {
        setProfileLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Save user profile
  const updateUserProfile = useCallback(async (profileData) => {
    try {
      await saveUserProfile(profileData);
      setUserProfile(profileData);
      if (profileData.onboardingCompleted) {
        setOnboardingCompleted(true);
        setShowOnboarding(false);
      }
      // Refresh profiles list
      const profiles = await getAllProfiles();
      setAllProfiles(profiles);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }, []);

  // Reset onboarding
  const handleResetOnboarding = useCallback(async () => {
    try {
      await resetOnboarding();
      setUserProfile(null);
      setOnboardingCompleted(false);
      setShowOnboarding(true);
      // Refresh profiles list
      const profiles = await getAllProfiles();
      setAllProfiles(profiles);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  }, []);

  // Switch to a different profile
  const handleSwitchProfile = useCallback(async (profileId) => {
    try {
      setProfileLoading(true);
      const profile = await switchProfile(profileId);
      if (profile) {
        setUserProfile(profile);
        setActiveProfileId(profileId);
        const completed = profile.onboardingCompleted || false;
        setOnboardingCompleted(completed);

        if (completed) {
          // Load profile-specific data
          const sessions = await getRecentSessions(7);
          setRecentSessions(sessions);
          const stats = await getTrainingStats();
          setTrainingStats(stats);
          const patterns = await getActiveAntiPatterns();
          setActiveAntiPatterns(patterns);
          setShowOnboarding(false);
        } else {
          // Clear data and show onboarding
          setRecentSessions([]);
          setTrainingStats(null);
          setActiveAntiPatterns([]);
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Error switching profile:', error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Create a new profile
  const handleCreateProfile = useCallback(async (profileData = null, setAsActive = true) => {
    try {
      const newId = await createProfile(profileData || {}, setAsActive);

      // Refresh profiles list
      const profiles = await getAllProfiles();
      setAllProfiles(profiles);

      if (setAsActive) {
        setActiveProfileId(newId);
        setUserProfile(profileData || {});
        setOnboardingCompleted(false);
        setShowOnboarding(true);
      }

      return newId;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }, []);

  // Delete a profile
  const handleDeleteProfile = useCallback(async (profileId) => {
    try {
      await deleteProfile(profileId);
      // Refresh profiles list
      const profiles = await getAllProfiles();
      setAllProfiles(profiles);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }, []);

  // Start pre-workout assessment
  const startPreWorkoutAssessment = useCallback(() => {
    setPreWorkoutData(null);
    setReadinessScore(null);
    setShowPreWorkout(true);
  }, []);

  // Complete pre-workout assessment
  const completePreWorkoutAssessment = useCallback((assessmentData) => {
    const score = calculateReadinessScore(assessmentData, userProfile);
    const enrichedData = {
      ...assessmentData,
      readinessScore: score,
      timestamp: new Date().toISOString()
    };

    setPreWorkoutData(enrichedData);
    setReadinessScore(score);
    setShowPreWorkout(false);

    return { score, data: enrichedData };
  }, [userProfile]);

  // Skip pre-workout assessment
  const skipPreWorkoutAssessment = useCallback(() => {
    setPreWorkoutData({
      skipped: true,
      readinessScore: 70, // Default neutral score
      timestamp: new Date().toISOString()
    });
    setReadinessScore(70);
    setShowPreWorkout(false);
  }, []);

  // Start post-workout feedback
  const startPostWorkoutFeedback = useCallback(() => {
    setPostWorkoutData(null);
    setShowPostWorkout(true);
  }, []);

  // Complete post-workout feedback
  const completePostWorkoutFeedback = useCallback(async (feedbackData) => {
    const enrichedData = {
      ...feedbackData,
      timestamp: new Date().toISOString()
    };

    setPostWorkoutData(enrichedData);
    setShowPostWorkout(false);

    // If pain was reported, save pain event
    if (feedbackData.pain && feedbackData.painAreas?.length > 0) {
      for (const area of feedbackData.painAreas) {
        await addPainEvent({
          area,
          intensity: feedbackData.painIntensity || 5,
          sessionRelated: true
        });
      }
    }

    // Calculate progression decision
    const progressionHistory = {
      recentSessions,
      painReported: feedbackData.pain,
      consecutiveHighRPE: calculateConsecutiveHighRPE(recentSessions)
    };

    const progression = calculateProgressionDecision(
      feedbackData.rpe,
      feedbackData.completion,
      progressionHistory
    );

    return { data: enrichedData, progression };
  }, [recentSessions]);

  // Calculate consecutive high RPE sessions
  const calculateConsecutiveHighRPE = (sessions) => {
    let count = 0;
    for (const session of sessions) {
      if (session.postWorkout?.rpe >= 8) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  // Skip post-workout feedback
  const skipPostWorkoutFeedback = useCallback(() => {
    setPostWorkoutData({
      skipped: true,
      timestamp: new Date().toISOString()
    });
    setShowPostWorkout(false);
  }, []);

  // Save complete session
  const saveCompleteSession = useCallback(async (workoutData) => {
    try {
      const sessionData = {
        day: workoutData.day,
        workoutTitle: workoutData.workoutTitle,
        duration: workoutData.duration,
        exerciseDetails: workoutData.exerciseDetails,
        preWorkout: preWorkoutData,
        postWorkout: postWorkoutData,
        completedAt: new Date().toISOString()
      };

      const sessionId = await saveSession(sessionData);

      // Refresh data
      const sessions = await getRecentSessions(7);
      setRecentSessions(sessions);

      const stats = await getTrainingStats();
      setTrainingStats(stats);

      // Clear current session data
      setCurrentSession(null);
      setPreWorkoutData(null);
      setPostWorkoutData(null);
      setReadinessScore(null);

      return sessionId;
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }, [preWorkoutData, postWorkoutData]);

  // Start a new workout session
  const startWorkoutSession = useCallback((workoutInfo) => {
    setCurrentSession({
      ...workoutInfo,
      startedAt: new Date().toISOString()
    });
  }, []);

  // Add anti-pattern
  const reportAntiPattern = useCallback(async (patternData) => {
    try {
      await addAntiPattern(patternData);
      const patterns = await getActiveAntiPatterns();
      setActiveAntiPatterns(patterns);
    } catch (error) {
      console.error('Error reporting anti-pattern:', error);
    }
  }, []);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    try {
      const sessions = await getRecentSessions(7);
      setRecentSessions(sessions);

      const stats = await getTrainingStats();
      setTrainingStats(stats);

      const patterns = await getActiveAntiPatterns();
      setActiveAntiPatterns(patterns);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }, []);

  const value = {
    // Profile
    userProfile,
    allProfiles,
    activeProfileId,
    onboardingCompleted,
    profileLoading,
    updateUserProfile,
    handleResetOnboarding,
    handleSwitchProfile,
    handleCreateProfile,
    handleDeleteProfile,

    // Session
    currentSession,
    preWorkoutData,
    postWorkoutData,
    readinessScore,
    startWorkoutSession,
    saveCompleteSession,

    // Pre-workout
    startPreWorkoutAssessment,
    completePreWorkoutAssessment,
    skipPreWorkoutAssessment,

    // Post-workout
    startPostWorkoutFeedback,
    completePostWorkoutFeedback,
    skipPostWorkoutFeedback,

    // History and stats
    recentSessions,
    trainingStats,
    activeAntiPatterns,
    refreshStats,
    reportAntiPattern,

    // UI state
    showOnboarding,
    setShowOnboarding,
    showPreWorkout,
    setShowPreWorkout,
    showPostWorkout,
    setShowPostWorkout,
    showProfile,
    setShowProfile
  };

  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
}

export default TrainingContext;
