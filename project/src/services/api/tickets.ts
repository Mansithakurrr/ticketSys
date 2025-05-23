import { apiClient } from './base';
import { Ticket, TicketStatus, Comment, Attachment, TicketPriority, TicketType } from '../../types';

export interface CreateTicketData {
  type: TicketType;
  priority: TicketPriority;
  subject: string;
  description: string;
  department?: string;
  attachments?: File[];
  customFields?: Record<string, any>;
  tags?: string[];
}

export interface UpdateTicketData {
  type?: TicketType;
  priority?: TicketPriority;
  status?: TicketStatus;
  subject?: string;
  description?: string;
  assignedTo?: string | null;
  department?: string;
  customFields?: Record<string, any>;
  tags?: string[];
}

export interface CreateCommentData {
  content: string;
  isInternal: boolean;
  attachments?: File[];
}

export interface TicketsFilter {
  status?: string[];
  priority?: string[];
  type?: string[];
  assignedTo?: string[];
  department?: string[];
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const ticketsService = {
  // Ticket operations
  async getTickets(filters: TicketsFilter = {}): Promise<{ data: Ticket[]; total: number }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    return apiClient.get(`/tickets?${params.toString()}`);
  },

  async getTicketById(id: string): Promise<Ticket> {
    return apiClient.get(`/tickets/${id}`);
  },

  async createTicket(ticketData: CreateTicketData): Promise<Ticket> {
    const formData = new FormData();
    
    // Append all ticket data as JSON
    const { attachments, ...rest } = ticketData;
    formData.append('data', JSON.stringify(rest));
    
    // Append files if any
    if (attachments) {
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    
    return apiClient.post('/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async updateTicket(id: string, updates: UpdateTicketData): Promise<Ticket> {
    return apiClient.put(`/tickets/${id}`, updates);
  },

  async updateTicketStatus(id: string, status: TicketStatus, comment?: string): Promise<Ticket> {
    return apiClient.patch(`/tickets/${id}/status`, { status, comment });
  },

  async deleteTicket(id: string): Promise<void> {
    await apiClient.delete(`/tickets/${id}`);
  },

  // Comment operations
  async addComment(ticketId: string, commentData: CreateCommentData): Promise<Comment> {
    const formData = new FormData();
    
    // Append comment data as JSON
    const { attachments, ...rest } = commentData;
    formData.append('data', JSON.stringify(rest));
    
    // Append files if any
    if (attachments) {
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    
    return apiClient.post(`/tickets/${ticketId}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async getComments(ticketId: string): Promise<Comment[]> {
    return apiClient.get(`/tickets/${ticketId}/comments`);
  },

  // Attachment operations
  async getAttachments(ticketId: string): Promise<Attachment[]> {
    return apiClient.get(`/tickets/${ticketId}/attachments`);
  },

  async downloadAttachment(ticketId: string, attachmentId: string): Promise<Blob> {
    return apiClient.get(`/tickets/${ticketId}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
  },

  async deleteAttachment(ticketId: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
  },

  // Status operations
  async getStatusHistory(ticketId: string): Promise<any[]> {
    return apiClient.get(`/tickets/${ticketId}/status-history`);
  },
};
