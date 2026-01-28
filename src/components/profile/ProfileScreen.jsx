import { useState } from 'react';
import { calculateAge, calculateBMI, getBMICategory, getAgeCategory } from '../../utils/calculations';
import {
  formatGender,
  formatGoal,
  formatExperience,
  formatCondition,
  formatList,
  formatDate
} from '../../utils/formatters';

export default function ProfileScreen({
  userProfile,
  trainingStats,
  allProfiles = [],
  activeProfileId,
  onClose,
  onResetOnboarding,
  onUpdateProfile,
  onSwitchProfile,
  onCreateProfile,
  onDeleteProfile
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  if (!userProfile) return null;

  const age = userProfile.birthDate ? calculateAge(userProfile.birthDate) : null;
  const bmi = calculateBMI(userProfile.weight, userProfile.height);
  const bmiCategory = getBMICategory(bmi);
  const ageCategory = getAgeCategory(age);

  const handleEdit = () => {
    setEditData({
      weight: userProfile.weight,
      height: userProfile.height,
      goal: userProfile.goal,
      experience: userProfile.experience
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editData && onUpdateProfile) {
      await onUpdateProfile({
        ...userProfile,
        ...editData
      });
    }
    setIsEditing(false);
    setEditData(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleReset = async () => {
    if (onResetOnboarding) {
      await onResetOnboarding();
    }
    setShowResetConfirm(false);
  };

  const handleSwitchProfile = async (profileId) => {
    if (onSwitchProfile && profileId !== activeProfileId) {
      await onSwitchProfile(profileId);
    }
    setShowProfileSwitcher(false);
  };

  const handleCreateNewProfile = async () => {
    if (onCreateProfile) {
      await onCreateProfile();
    }
    setShowProfileSwitcher(false);
  };

  const handleDeleteProfile = async (profileId) => {
    if (onDeleteProfile) {
      await onDeleteProfile(profileId);
    }
    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="bg-[var(--primary)] text-white">
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setShowProfileSwitcher(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="text-lg font-semibold">Profilo</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-white text-[var(--primary)] rounded-full text-sm font-medium"
            >
              Salva
            </button>
          )}
        </div>

        {/* Profile Header */}
        <div className="px-4 pb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
            {userProfile.name?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="text-xl font-bold">{userProfile.name}</h2>
          <p className="text-white/70 text-sm">
            {formatGender(userProfile.gender)} - {age} anni ({ageCategory.label})
          </p>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto -mt-4">
        {/* Stats Card */}
        <div className="card p-4 mb-4">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Statistiche fisiche
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-[var(--surface-hover)] rounded-lg">
              {isEditing ? (
                <input
                  type="number"
                  value={editData?.weight || ''}
                  onChange={(e) => setEditData({ ...editData, weight: parseFloat(e.target.value) })}
                  className="w-full text-center text-xl font-bold bg-transparent border-b-2 border-[var(--primary)] outline-none"
                />
              ) : (
                <div className="text-xl font-bold">{userProfile.weight}</div>
              )}
              <div className="text-xs text-[var(--text-secondary)]">kg</div>
            </div>
            <div className="text-center p-2 bg-[var(--surface-hover)] rounded-lg">
              {isEditing ? (
                <input
                  type="number"
                  value={editData?.height || ''}
                  onChange={(e) => setEditData({ ...editData, height: parseInt(e.target.value) })}
                  className="w-full text-center text-xl font-bold bg-transparent border-b-2 border-[var(--primary)] outline-none"
                />
              ) : (
                <div className="text-xl font-bold">{userProfile.height}</div>
              )}
              <div className="text-xs text-[var(--text-secondary)]">cm</div>
            </div>
            <div className="text-center p-2 bg-[var(--surface-hover)] rounded-lg">
              <div className="text-xl font-bold" style={{ color: bmiCategory.color }}>{bmi}</div>
              <div className="text-xs text-[var(--text-secondary)]">BMI</div>
            </div>
            <div className="text-center p-2 bg-[var(--surface-hover)] rounded-lg">
              <div className="text-xl font-bold">{age}</div>
              <div className="text-xs text-[var(--text-secondary)]">anni</div>
            </div>
          </div>

          {/* BMI Indicator */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
              <span>Sottopeso</span>
              <span>Normopeso</span>
              <span>Sovrappeso</span>
              <span>Obesita</span>
            </div>
            <div className="h-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full relative">
              <div
                className="absolute w-3 h-3 bg-white border-2 border-[var(--text)] rounded-full -top-0.5"
                style={{ left: `${Math.min(95, Math.max(5, ((bmi - 15) / 25) * 100))}%` }}
              />
            </div>
            <p className="text-center text-sm mt-2" style={{ color: bmiCategory.color }}>
              {bmiCategory.label}
            </p>
          </div>
        </div>

        {/* Training Stats */}
        {trainingStats && trainingStats.totalSessions > 0 && (
          <div className="card p-4 mb-4">
            <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
              Statistiche allenamento
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--primary)]">
                  {trainingStats.totalSessions}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Sessioni</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--primary)]">
                  {trainingStats.streak}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--primary)]">
                  {trainingStats.averageCompletion}%
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Completamento</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="text-center p-2 bg-[var(--surface-hover)] rounded-lg">
                <div className="text-lg font-semibold">{trainingStats.averageRPE}</div>
                <div className="text-xs text-[var(--text-secondary)]">RPE medio</div>
              </div>
              <div className="text-center p-2 bg-[var(--surface-hover)] rounded-lg">
                <div className="text-lg font-semibold">{trainingStats.averageReadiness}</div>
                <div className="text-xs text-[var(--text-secondary)]">Readiness media</div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="card p-4 mb-4">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Dettagli profilo
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-secondary)]">Obiettivo</span>
              <span className="font-medium">{formatGoal(userProfile.goal)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-secondary)]">Livello</span>
              <span className="font-medium">{formatExperience(userProfile.experience)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-secondary)]">Data di nascita</span>
              <span className="font-medium">{formatDate(userProfile.birthDate)}</span>
            </div>
            <div className="flex justify-between items-start py-2">
              <span className="text-[var(--text-secondary)]">Limitazioni</span>
              <span className="font-medium text-right max-w-[60%]">
                {userProfile.conditions?.length > 0
                  ? formatList(userProfile.conditions, formatCondition)
                  : 'Nessuna'}
              </span>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="card p-4 mb-4">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Account
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Profilo creato</span>
              <span>{formatDate(userProfile.createdAt)}</span>
            </div>
            {userProfile.updatedAt && (
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Ultimo aggiornamento</span>
                <span>{formatDate(userProfile.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card p-4 mb-8 border-red-200">
          <h3 className="text-xs font-medium text-red-500 uppercase tracking-wide mb-3">
            Zona pericolosa
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Resettando l'onboarding perderai tutte le impostazioni del profilo.
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 px-4 border-2 border-red-300 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors"
          >
            Reset Onboarding
          </button>
        </div>

        {/* Edit Mode Cancel */}
        {isEditing && (
          <button
            onClick={handleCancelEdit}
            className="w-full py-3 text-[var(--text-secondary)] mb-8"
          >
            Annulla modifiche
          </button>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg width="32" height="32" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Sei sicuro?</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Questa azione cancellerà i dati del tuo profilo e dovrai rifare l'onboarding.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 px-4 bg-[var(--surface-hover)] rounded-xl font-medium"
                >
                  Annulla
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Switcher Modal */}
      {showProfileSwitcher && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setShowProfileSwitcher(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-[var(--border)]">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-bold text-center">Cambia Profilo</h3>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {/* Existing Profiles */}
              <div className="space-y-2 mb-4">
                {allProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      profile.id === activeProfileId
                        ? 'bg-[var(--primary)]/10 border-2 border-[var(--primary)]'
                        : 'bg-[var(--surface-hover)] border-2 border-transparent'
                    }`}
                  >
                    <button
                      onClick={() => handleSwitchProfile(profile.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                        profile.id === activeProfileId
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--border)] text-[var(--text-secondary)]'
                      }`}>
                        {profile.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-medium">{profile.name || 'Profilo senza nome'}</div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {profile.onboardingCompleted ? 'Completato' : 'Da completare'}
                        </div>
                      </div>
                    </button>
                    {profile.id === activeProfileId && (
                      <svg width="20" height="20" fill="var(--primary)" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                    {profile.id !== activeProfileId && allProfiles.length > 1 && (
                      <button
                        onClick={() => setShowDeleteConfirm(profile.id)}
                        className="p-2 text-red-400 hover:text-red-500"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Profile Button */}
              <button
                onClick={handleCreateNewProfile}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium">Aggiungi nuovo profilo</span>
              </button>
            </div>

            <div className="p-4 border-t border-[var(--border)]">
              <button
                onClick={() => setShowProfileSwitcher(false)}
                className="w-full py-3 bg-[var(--surface-hover)] rounded-xl font-medium"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Profile Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg width="32" height="32" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Elimina profilo?</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Questa azione eliminerà definitivamente questo profilo e tutti i suoi dati.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 bg-[var(--surface-hover)] rounded-xl font-medium"
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleDeleteProfile(showDeleteConfirm)}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
