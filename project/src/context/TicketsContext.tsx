import { createContext, useContext, useState } from 'react';
import { Ticket, TicketStatus, Comment, Notification, Attachment } from '../types';
import { tickets as mockTickets, notifications as mockNotifications } from '../data/mockData';
import { useAuth } from './AuthContext';
import { useAuditTrail } from './AuditTrailContext';
import { AuditTrailEvent, AuditEventType } from '../types/audit';

// Extend AuditTrailEvent with new event types
export interface ExtendedAuditTrailEvent extends AuditTrailEvent {
  eventType: AuditEventType | 'priority_change' | 'assignment_change' | 'custom_field_change';
}

// Extend AuditTrailContext's logEvent function to accept new event types
export interface ExtendedAuditTrailContext extends ReturnType<typeof useAuditTrail> {
  logEvent: (event: Omit<ExtendedAuditTrailEvent, 'id' | 'timestamp'>) => void;
}

export const useExtendedAuditTrail = (): ExtendedAuditTrailContext => {
  const context = useAuditTrail();
  if (!context) {
    throw new Error('useExtendedAuditTrail must be used within an AuditTrailProvider');
  }
  return context;
};

interface TicketsContextType {
  tickets: Ticket[];
  notifications: Notification[];
  getTicketById: (id: string) => Ticket | undefined;
  getTicketsByUser: (userId: string) => Ticket[];
  getTicketsByStatus: (status: TicketStatus) => Ticket[];
  createTicket: (ticketData: Partial<Ticket>) => Promise<Ticket>;
  updateTicket: (id: string, updates: Partial<Ticket> & { comment?: string }) => Promise<Ticket>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<Ticket>;
  addComment: (ticketId: string, content: string, isInternal: boolean) => Promise<Comment>;
  handleFileUpload: (ticketId: string, file: File) => Promise<Attachment>;
  markNotificationAsRead: (id: string) => void;
  getUserNotifications: () => Notification[];
  getTicketAuditTrail: (ticketId: string) => AuditTrailEvent[];
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export const useTickets = (): TicketsContextType => {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketsProvider');
  }
  return context;
};

export const TicketsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const { currentUser } = useAuth();
  const { logEvent, getTicketAuditTrail } = useExtendedAuditTrail();

  const getTicketById = (id: string): Ticket | undefined => {
    return tickets.find(ticket => ticket.id === id);
  };

  const getTicketsByUser = (userId: string): Ticket[] => {
    return tickets.filter(ticket => ticket.assignedTo === userId);
  };

  const getTicketsByStatus = (status: TicketStatus): Ticket[] => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const createTicket = async (ticketData: Partial<Ticket>): Promise<Ticket> => {
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      userId: currentUser?.id || '',
      assignedTo: null,
      type: ticketData.type || 'other',
      priority: ticketData.priority || 'medium',
      status: 'new',
      subject: ticketData.subject || '',
      description: ticketData.description || '',
      attachments: ticketData.attachments || [],
      comments: [],
      statusHistory: [
        {
          id: `status-change-1`,
          ticketId: `ticket-${Date.now()}`,
          fromStatus: 'new',
          toStatus: 'new',
          changedAt: new Date(),
          changedBy: currentUser?.id || 'system',
          comment: ''
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTickets(prev => [...prev, newTicket]);

    logEvent({
      ticketId: newTicket.id,
      eventType: 'ticket_created' as AuditEventType,
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'System',
      metadata: {
        subject: newTicket.subject,
        description: newTicket.description,
        priority: newTicket.priority,
        type: newTicket.type
      }
    });

    return newTicket;
  };

  const updateTicket = async (id: string, updates: Partial<Ticket> & { comment?: string }): Promise<Ticket> => {
    const ticket = getTicketById(id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    let updatedTicket = { ...ticket };
    const previousStatus = ticket.status !== updates.status;

    updatedTicket = {
      ...ticket,
      ...updates,
      updatedAt: new Date(),
      statusHistory: previousStatus ? [...(ticket.statusHistory || []), { 
        id: `status-change-${(ticket.statusHistory?.length || 0) + 1}`,
        ticketId: id,
        fromStatus: ticket.status,
        toStatus: updates.status as TicketStatus,
        changedAt: new Date(),
        changedBy: currentUser?.id || 'system',
        comment: updates.comment || ''
      }] : ticket.statusHistory || []
    };

    setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));

    if (previousStatus) {
      logEvent({
        ticketId: id,
        eventType: 'status_change' as AuditEventType,
        userId: currentUser?.id || 'system',
        userName: currentUser?.name || 'System',
        metadata: {
          fromStatus: ticket.status,
          toStatus: updates.status as TicketStatus,
          comment: updates.comment || '',
          subject: ticket.subject,
          type: ticket.type
        }
      });
    }

    return updatedTicket;
  };

  const updateTicketStatus = async (id: string, status: TicketStatus, comment?: string): Promise<Ticket> => {
    const ticket = getTicketById(id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return updateTicket(id, {
      status,
      comment
    });
  };

  const addComment = async (ticketId: string, content: string, isInternal: boolean = false): Promise<Comment> => {
    const ticket = getTicketById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUser?.id || '',
      content,
      isInternal,
      createdAt: new Date(),
      attachments: []
    };

    await updateTicket(ticketId, {
      comments: [...(ticket.comments || []), newComment]
    });

    logEvent({
      ticketId,
      eventType: isInternal ? 'note_added' : 'reply' as AuditEventType,
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'System',
      metadata: {
        commentId: newComment.id,
        isInternal,
        content: content.substring(0, 100) + (content.length > 100 ? '...' : '')
      }
    });

    return newComment;
  };

  const handleFileUpload = async (ticketId: string, file: File): Promise<Attachment> => {
    const attachmentId = Date.now().toString();
    const newAttachment: Attachment = {
      id: attachmentId,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedBy: currentUser?.id || 'system',
      uploadedAt: new Date(),
      type: file.type
    };

    logEvent({
      ticketId,
      eventType: 'attachment_add' as AuditEventType,
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'System',
      metadata: {
        id: attachmentId,
        filename: file.name,
        size: file.size,
        type: file.type
      }
    });

    await updateTicket(ticketId, {
      attachments: [...(getTicketById(ticketId)?.attachments || []), newAttachment],
    });

    return newAttachment;
  };

  const markNotificationAsRead = (id: string): void => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const getUserNotifications = (): Notification[] => {
    return notifications.filter(n => !n.read);
  };

  return (
    <TicketsContext.Provider value={{
      tickets,
      notifications,
      getTicketById,
      getTicketsByUser,
      getTicketsByStatus,
      createTicket,
      updateTicket,
      updateTicketStatus,
      addComment,
      handleFileUpload,
      markNotificationAsRead,
      getUserNotifications,
      getTicketAuditTrail
    }}>
      {children}
    </TicketsContext.Provider>
  );
};