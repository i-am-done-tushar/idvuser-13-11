import { useState, useEffect, useCallback } from 'react';

export interface SessionState {
  shortCode: string;
  templateVersionId?: number;
  userId?: number;
  sessionId: string;
  currentStep: string;
  uploadedDocuments: string[];
  formData: Record<string, any>;
  lastUpdated: number;
}

const SESSION_STORAGE_KEY = 'idv_session_state';
const SYNC_INTERVAL = 5000; // 5 seconds

/**
 * Hook for managing cross-device session synchronization
 */
export function useSessionSync(initialState: Partial<SessionState>) {
  const [sessionState, setSessionState] = useState<SessionState>(() => {
    // Try to load existing session from localStorage
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with initial state, prioritizing saved state
        return {
          sessionId: generateSessionId(),
          currentStep: 'document-upload',
          uploadedDocuments: [],
          formData: {},
          lastUpdated: Date.now(),
          ...parsed,
          ...initialState,
        };
      } catch (error) {
        console.error('Failed to parse saved session:', error);
      }
    }
    
    // Create new session state
    return {
      sessionId: generateSessionId(),
      currentStep: 'document-upload',
      uploadedDocuments: [],
      formData: {},
      lastUpdated: Date.now(),
      ...initialState,
    } as SessionState;
  });

  // Save session state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
  }, [sessionState]);

  // Update session state (memoized to prevent unnecessary re-renders)
  const updateSession = useCallback((updates: Partial<SessionState>) => {
    setSessionState(prev => ({
      ...prev,
      ...updates,
      lastUpdated: Date.now(),
    }));
  }, []);

  // Clear session (memoized to prevent unnecessary re-renders)
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSessionState({
      sessionId: generateSessionId(),
      currentStep: 'document-upload',
      uploadedDocuments: [],
      formData: {},
      lastUpdated: Date.now(),
      ...initialState,
    } as SessionState);
  }, [initialState]);

  // Simulate server sync (in a real implementation, this would sync with backend)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      // In a real app, you would:
      // 1. Send session state to server
      // 2. Check for updates from other devices
      // 3. Merge any conflicts
      console.log('Session sync check:', sessionState.sessionId);
    }, SYNC_INTERVAL);

    return () => clearInterval(syncInterval);
  }, [sessionState.sessionId]); // Only depend on sessionId, not the entire sessionState

  return {
    sessionState,
    updateSession,
    clearSession,
  };
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}