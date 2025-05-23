import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuditTrailEvent, AuditTrailContextType } from '../types/audit';

const AuditTrailContext = createContext<AuditTrailContextType | undefined>(undefined);

export const AuditTrailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<AuditTrailEvent[]>([]);

  const logEvent = (event: Omit<AuditTrailEvent, 'id' | 'timestamp'>) => {
    const newEvent: AuditTrailEvent = {
      ...event,
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
    };
    
    setEvents(prev => [newEvent, ...prev]);
    // In a real app, you would also send this to your backend
    console.log('Audit Event:', newEvent);
  };

  const getTicketAuditTrail = (ticketId: string) => {
    return events.filter(event => event.ticketId === ticketId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  return (
    <AuditTrailContext.Provider value={{ events, logEvent, getTicketAuditTrail }}>
      {children}
    </AuditTrailContext.Provider>
  );
};

export const useAuditTrail = (): AuditTrailContextType => {
  const context = useContext(AuditTrailContext);
  if (!context) {
    throw new Error('useAuditTrail must be used within an AuditTrailProvider');
  }
  return context;
};

export default AuditTrailContext;
