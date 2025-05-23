export type AuditEventType = 
  | 'ticket_created'
  | 'reply'
  | 'forward'
  | 'assign'
  | 'close'
  | 'feedback'
  | 'status_change'
  | 'priority_change'
  | 'assignment_change'
  | 'custom_field_change'
  | 'attachment_add'
  | 'attachment_delete'
  | 'field_change'
  | 'sla_breach'
  | 'escalation'
  | 'merge'
  | 'split'
  | 'tag_added'
  | 'tag_removed'
  | 'note_added'
  | 'note_deleted'
  | 'ticket_reopened'
  | 'sla_updated'
  | 'sla_met';

export interface AuditTrailEvent {
  id: string;
  ticketId: string;
  eventType: AuditEventType;
  userId: string;
  userName: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface AuditTrailContextType {
  events: AuditTrailEvent[];
  logEvent: (event: Omit<AuditTrailEvent, 'id' | 'timestamp'>) => void;
  getTicketAuditTrail: (ticketId: string) => AuditTrailEvent[];
}
