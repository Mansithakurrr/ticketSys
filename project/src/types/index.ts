export type UserRole = 'user' | 'admin' | 'support' | 'supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export type TicketStatus = 'new' | 'in-progress' | 'on-hold' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketType = 'bug' | 'feature-request' | 'technical-support' | 'other';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  editedAt?: Date;
  attachments: Attachment[];
  ticketId?: string; // Optional field for backward compatibility
}

export interface StatusChange {
  id: string;
  ticketId: string;
  fromStatus: TicketStatus;
  toStatus: TicketStatus;
  changedBy: string;
  changedAt: Date;
  comment?: string;
}

export interface SLA {
  id: string;
  priority: TicketPriority;
  responseTime: number; // in minutes
  resolutionTime: number; // in minutes
  businessHours: {
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
    workDays: number[]; // 0-6, where 0 is Sunday
  };
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  userId: string;
  assignedTo: string | null;
  department?: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  attachments: Attachment[];
  comments: Comment[];
  statusHistory: StatusChange[];
  sla?: {
    responseDeadline: Date;
    resolutionDeadline: Date;
    isBreached: boolean;
  };
  customFields?: Record<string, any>;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  ticketId: string;
  message: string;
  read: boolean;
  type: 'status_change' | 'comment' | 'assignment' | 'mention' | 'sla_breach';
  createdAt: Date;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox';
  label: string;
  required: boolean;
  options?: string[];
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export interface PerformanceMetrics {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    ticketsResolved: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    customerSatisfactionScore: number;
    slaComplianceRate: number;
  };
}

export interface FilterView {
  id: string;
  name: string;
  userId: string;
  filters: {
    status?: TicketStatus[];
    priority?: TicketPriority[];
    type?: TicketType[];
    assignedTo?: string[];
    department?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    tags?: string[];
    customFields?: Record<string, any>;
  };
  sortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'ticket' | 'user' | 'department' | 'sla' | 'custom_field';
  entityId: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  timestamp: Date;
  ipAddress: string;
}