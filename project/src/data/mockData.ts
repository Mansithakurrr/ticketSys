import { User, Ticket, Notification, Department, SLA } from '../types';

// Mock Users
export const users: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    isActive: true,
    createdAt: new Date('2024-01-02'),
  },
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'support-1',
    name: 'Sarah Support',
    email: 'sarah@example.com',
    role: 'support',
    department: 'technical',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    isActive: true,
    createdAt: new Date('2024-01-03'),
  },
  {
    id: 'support-2',
    name: 'Mike Support',
    email: 'mike@example.com',
    role: 'support',
    department: 'billing',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    isActive: true,
    createdAt: new Date('2024-01-04'),
  },
  {
    id: 'supervisor-1',
    name: 'Tom Supervisor',
    email: 'tom@example.com',
    role: 'supervisor',
    department: 'technical',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
    isActive: true,
    createdAt: new Date('2024-01-05'),
  },
];

// Mock Departments
export const departments: Department[] = [
  {
    id: 'dept-1',
    name: 'Technical Support',
    description: 'Handles technical issues and bug reports',
    managerId: 'supervisor-1',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'dept-2',
    name: 'Billing Support',
    description: 'Handles billing and payment issues',
    managerId: 'supervisor-2',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'dept-3',
    name: 'Feature Requests',
    description: 'Handles new feature requests and product feedback',
    managerId: 'supervisor-1',
    createdAt: new Date('2024-01-01'),
  },
];

// Mock SLA Policies
export const slaConfigs: SLA[] = [
  {
    id: 'sla-1',
    priority: 'critical',
    responseTime: 30, // 30 minutes
    resolutionTime: 240, // 4 hours
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC',
      workDays: [1, 2, 3, 4, 5], // Monday to Friday
    },
  },
  {
    id: 'sla-2',
    priority: 'high',
    responseTime: 60, // 1 hour
    resolutionTime: 480, // 8 hours
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC',
      workDays: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'sla-3',
    priority: 'medium',
    responseTime: 240, // 4 hours
    resolutionTime: 1440, // 24 hours
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC',
      workDays: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'sla-4',
    priority: 'low',
    responseTime: 480, // 8 hours
    resolutionTime: 2880, // 48 hours
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC',
      workDays: [1, 2, 3, 4, 5],
    },
  },
];

// Mock Tickets (keeping existing tickets and adding more with enhanced data)
export const tickets: Ticket[] = [
  {
    id: 'ticket-1',
    userId: 'user-1',
    assignedTo: 'support-1',
    department: 'technical',
    type: 'bug',
    priority: 'high',
    status: 'in-progress',
    subject: 'Application crashes on login',
    description: 'When trying to log in using my credentials, the application crashes and returns to the login screen without any error message. This happens consistently on Chrome version 108.',
    attachments: [
      {
        id: 'attachment-1',
        name: 'error-screenshot.png',
        size: 1024 * 1024 * 2, // 2MB
        type: 'image/png',
        url: '#',
        uploadedBy: 'user-1',
        uploadedAt: new Date('2024-03-10T08:30:00'),
      },
    ],
    comments: [
      {
        id: 'comment-1',
        userId: 'user-1',
        content: 'I tried clearing my cache but the issue persists.',
        isInternal: false,
        createdAt: new Date('2024-03-10T08:30:00'),
        attachments: [],
      },
      {
        id: 'comment-2',
        userId: 'support-1',
        content: 'Looking into this issue. Might be related to the recent update.',
        isInternal: true,
        createdAt: new Date('2024-03-10T09:15:00'),
        attachments: [],
      },
    ],
    statusHistory: [
      {
        id: 'status-1',
        ticketId: 'ticket-1',
        fromStatus: 'new',
        toStatus: 'in-progress',
        changedBy: 'support-1',
        changedAt: new Date('2024-03-10T09:15:00'),
        comment: 'Taking ownership of this ticket',
      },
    ],
    sla: {
      responseDeadline: new Date('2024-03-10T09:30:00'),
      resolutionDeadline: new Date('2024-03-10T16:30:00'),
      isBreached: false,
    },
    tags: ['chrome', 'login', 'crash'],
    createdAt: new Date('2024-03-10T08:00:00'),
    updatedAt: new Date('2024-03-10T09:15:00'),
  },
  // ... (keeping other existing tickets)
];

// Mock Notifications (keeping existing notifications and adding more with enhanced data)
export const notifications: Notification[] = [
  {
    id: 'notification-1',
    userId: 'user-1',
    ticketId: 'ticket-1',
    message: 'Your ticket "Application crashes on login" has been assigned to Sarah Support.',
    read: false,
    createdAt: new Date('2024-03-10T09:00:00'),
    type: 'assignment',
  },
  // ... (keeping other existing notifications)
];