import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { realtimeStore } from './services/realtimeStore';
import { Header } from './components/shared/Header';
import { CriticalAlertBanner } from './features/announcements/CriticalAlertBanner';
import { ParticipantDashboard } from './features/dashboards/ParticipantDashboard';
import { JudgeDashboard } from './features/dashboards/JudgeDashboard';
import { OrganizerDashboard } from './features/dashboards/OrganizerDashboard';
import { RegistrationModal } from './features/registration/RegistrationModal';
import { CreateTeamModal } from './features/teams/CreateTeamModal';
import { Modal } from './components/shared/Modal';
import { AttendeeBadge } from './features/registration/AttendeeBadge';
import { ToastProvider } from './components/shared/Toast';

const AppContent: React.FC = () => {
  const [, setTick] = useState(0);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Subscribe to real-time store changes with automatic cleanup on unmount
  useEffect(() => {
    const unsubscribe = realtimeStore.subscribe(() => {
      setTick(prev => prev + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const currentRole = realtimeStore.getCurrentRole();
  const currentUser = realtimeStore.getCurrentUser();
  const announcements = realtimeStore.getAnnouncements();
  const checkins = realtimeStore.getCheckIns();
  const userCheckIn = currentUser ? checkins.find(c => c.userId === currentUser.id) : undefined;

  const handleRoleChange = (role: UserRole) => {
    realtimeStore.setRole(role);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-brand-500 selection:text-black">
      
      {/* Sticky Header */}
      <Header
        currentRole={currentRole}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenPass={() => setIsPassModalOpen(true)}
      />

      {/* Critical Broadcast Alert Banner */}
      <CriticalAlertBanner announcements={announcements} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRole === 'participant' && currentUser && (
          <ParticipantDashboard
            currentUser={currentUser}
            onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
          />
        )}

        {currentRole === 'judge' && currentUser && (
          <JudgeDashboard currentUser={currentUser} />
        )}

        {currentRole === 'organizer' && currentUser && (
          <OrganizerDashboard
            currentUser={currentUser}
            onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
          />
        )}
      </main>

      {/* Global Modals */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => {}}
      />

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        onSuccess={() => {}}
      />

      {currentUser && (
        <Modal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          title="Digital Attendee Pass"
          subtitle={`Official credential for ${currentUser.name}`}
          maxWidth="md"
        >
          <AttendeeBadge user={currentUser} checkIn={userCheckIn} />
        </Modal>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
