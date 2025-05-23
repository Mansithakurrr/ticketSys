import React, { useState, useEffect, useMemo, useRef } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuditTrail } from '../../context/AuditTrailContext';
import { AuditTrailEvent, AuditEventType } from '../../types/audit';
import Badge from '../ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Check,
  MessageCircle,
  Forward,
  ThumbsUp,
  FileText,
  FileEdit,
  Paperclip,
  CheckSquare
} from 'lucide-react';

type Checkpoint = {
  id: string;
  label?: string;
  description: string;
  eventType: AuditEventType | string;
  icon: string | React.ReactNode;
  completed: boolean;
  isNewlyCompleted?: boolean;
  timestamp?: Date;
};

interface TicketTrailProps {
  ticketId: string;
}

const EventIcon = ({ type }: { type: AuditEventType }) => {
  const iconMap: Record<string, { icon: string; color: string }> = {
    ticket_created: { icon: '🎫', color: 'bg-green-100 text-green-700' },
    reply: { icon: '💬', color: 'bg-blue-100 text-blue-700' },
    status_change: { icon: '🔄', color: 'bg-purple-100 text-purple-700' },
    assignment_change: { icon: '👤', color: 'bg-yellow-100 text-yellow-700' },
    priority_change: { icon: '⚠️', color: 'bg-orange-100 text-orange-700' },
    close: { icon: '🔒', color: 'bg-gray-100 text-gray-700' },
    attachment_add: { icon: '📎', color: 'bg-blue-100 text-blue-700' },
    attachment_delete: { icon: '🗑️', color: 'bg-red-100 text-red-700' },
    note_added: { icon: '📝', color: 'bg-green-100 text-green-700' },
    note_deleted: { icon: '🗑️', color: 'bg-red-100 text-red-700' },
  };

  const { icon, color } = iconMap[type] || { icon: '📋', color: 'bg-gray-100 text-gray-700' };
  
  return (
    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${color} text-lg`}>
      {icon}
    </div>
  );
};

const StatusBadge = ({ from, to }: { from: string; to: string }) => (
  <div className="flex items-center space-x-1">
    <Badge variant="outline" className="bg-gray-100">{from}</Badge>
    <span className="text-gray-400">→</span>
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
      {to}
    </Badge>
  </div>
);

export const TicketTrail: React.FC<TicketTrailProps> = ({ ticketId }) => {
  const { events, getTicketAuditTrail } = useAuditTrail();
  const [ticketEvents, setTicketEvents] = useState<AuditTrailEvent[]>([]);
  
  // Get the ticket creation event
  const ticketCreatedEvent = useMemo(() => {
    const event = getTicketAuditTrail(ticketId).find(
      (event) => event.eventType === 'ticket_created'
    );
    
    // If no creation event found, create a mock one with current time
    if (!event) {
      return {
        id: 'ticket-created',
        ticketId,
        eventType: 'ticket_created',
        userId: 'system',
        userName: 'System',
        timestamp: new Date(),
        metadata: {}
      } as AuditTrailEvent;
    }
    return event;
  }, [ticketId, getTicketAuditTrail]);

  const checkpoints: Checkpoint[] = useMemo(() => [
    {
      id: 'ticket-created',
      label: 'Ticket Raised',
      description: 'Ticket is submitted by the customer or via system integration',
      eventType: 'ticket_created',
      icon: <FileText className="w-4 h-4" />,
      completed: true, // Ticket creation is always completed
      timestamp: ticketCreatedEvent?.timestamp || new Date()
    },
    {
      id: 'helpdesk_reply',
      label: 'Helpdesk/Admin Reply',
      eventType: 'reply',
      icon: <MessageCircle className="w-4 h-4" />,
      completed: false,
      description: 'Agent adds a public or internal note to the ticket'
    },
    {
      id: 'forwarded',
      label: 'Forwarded/Assigned',
      eventType: 'assign',
      icon: <Forward className="w-4 h-4" />,
      completed: false,
      description: 'Ticket is routed or reassigned to a resolution team or specialist',
      timestamp: undefined
    },
    {
      id: 'field_edits',
      label: 'Field Edits',
      eventType: 'field_change',
      icon: <FileEdit className="w-4 h-4" />,
      completed: false,
      description: 'Status, priority, SLA or custom fields are updated',
      timestamp: undefined
    },
    {
      id: 'attachments',
      label: 'Attachment Changes',
      eventType: 'attachment_add',
      icon: <Paperclip className="w-4 h-4" />,
      completed: false,
      description: 'Files added or removed from the ticket',
      timestamp: undefined
    },
    {
      id: 'closed',
      label: 'Closed',
      eventType: 'close',
      icon: <CheckSquare className="w-4 h-4" />,
      completed: false,
      description: 'Agent marks ticket as resolved/closed',
      timestamp: undefined
    },
    {
      id: 'feedback',
      label: 'Customer Confirmation',
      eventType: 'feedback',
      icon: <ThumbsUp className="w-4 h-4" />,
      completed: false,
      description: 'Customer acknowledges resolution or provides satisfaction rating',
      timestamp: undefined
    }
  ], []);

  const previousCheckpoints = useRef<Checkpoint[]>([]);
  
  // Update checkpoints based on actual events
  const updatedCheckpoints = useMemo(() => {
    const ticketEvents = getTicketAuditTrail(ticketId);
    
    const newCheckpoints = checkpoints.map(checkpoint => {
      const event = ticketEvents.find(e => e.eventType === checkpoint.eventType);
      const completed = !!event;
      
      return {
        ...checkpoint,
        completed,
        timestamp: event?.timestamp,
        description: completed ? 
          `${checkpoint.label} on ${format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}` : 
          checkpoint.description,
        isNewlyCompleted: false
      };
    });

    // Check for newly completed checkpoints
    if (previousCheckpoints.current.length > 0) {
      newCheckpoints.forEach((cp, index) => {
        const wasCompleted = previousCheckpoints.current[index]?.completed || false;
        if (cp.completed && !wasCompleted) {
          cp.isNewlyCompleted = true;
        }
      });
    }

    previousCheckpoints.current = [...newCheckpoints];
    return newCheckpoints;
  }, [checkpoints, ticketId, getTicketAuditTrail]);

  // Check if ticket was just closed
  const [showConfetti, setShowConfetti] = useState(false);
  const wasClosed = useRef(false);

  useEffect(() => {
    const isClosed = updatedCheckpoints.some(cp => cp.eventType === 'close' && cp.completed);
    
    if (isClosed && !wasClosed.current) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      wasClosed.current = true;
      return () => clearTimeout(timer);
    } else if (!isClosed) {
      wasClosed.current = false;
    }
  }, [updatedCheckpoints]);

  // Reset newly completed state after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      updatedCheckpoints.forEach(cp => {
        if (cp.isNewlyCompleted) {
          cp.isNewlyCompleted = false;
        }
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [updatedCheckpoints]);
  
  // Determine the current active checkpoint
  const activeCheckpointIndex = updatedCheckpoints.findIndex(cp => !cp.completed) - 1;

  useEffect(() => {
    const ticketEvents = getTicketAuditTrail(ticketId);
    setTicketEvents(ticketEvents);
  }, [ticketId, getTicketAuditTrail, events]);

  const formatEventDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  const getEventContent = (event: AuditTrailEvent) => {
    const { eventType, metadata } = event;
    const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });
    
    switch (eventType) {
      case 'status_change':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Status Updated</h4>
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>
            <StatusBadge from={metadata?.fromStatus} to={metadata?.toStatus} />
            {metadata?.comment && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <p className="text-gray-600">{metadata.comment}</p>
              </div>
            )}
          </div>
        );
      
      case 'reply':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">New Reply</h4>
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded text-sm">
              <p className="text-gray-800">{metadata?.content}</p>
              {metadata?.isInternal && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                  Internal Note
                </span>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium capitalize">
                {eventType.replace(/_/g, ' ')}
              </h4>
              {metadata && Object.entries(metadata).map(([key, val]) => (
                <p key={key} className="text-sm text-gray-600">
                  <span className="font-medium">{key}:</span> {String(val)}
                </p>
              ))}
            </div>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
        );
    }
  };

  if (ticketEvents.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed rounded-lg">
        <div className="text-gray-400 mb-2">📋</div>
        <h3 className="text-sm font-medium text-gray-900">No activity yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Activity related to this ticket will appear here
        </p>
      </div>
    );
  }

  const renderCheckpointIcon = (checkpoint: Checkpoint, isActive: boolean, isCompleted: boolean) => {
    const baseClasses = 'w-6 h-6 flex items-center justify-center';
    
    if (isCompleted) {
      return <CheckCircle className={`${baseClasses} text-green-500`} strokeWidth={2} />;
    }
    
    if (isActive) {
      return (
        <div className="relative">
          <ArrowRight 
            className={`${baseClasses} text-blue-600`} 
            strokeWidth={2.5}
          />
          <motion.span
            className="absolute inset-0 rounded-full bg-blue-100"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      );
    }
    
    // If icon is a string, render it as text, otherwise render as React node
    return typeof checkpoint.icon === 'string' ? (
      <span className={baseClasses}>{checkpoint.icon}</span>
    ) : (
      <span className={baseClasses}>{checkpoint.icon}</span>
    );
  };

  return (
    <div className="space-y-6 relative">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            gravity={0.2}
          />
        </div>
      )}
      
      {/* Checkpoints */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            Ticket Progress
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
              {updatedCheckpoints.filter(cp => cp.completed).length} of {updatedCheckpoints.length} completed
            </span>
          </div>
        </div>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200">
            <motion.div 
              className="h-full bg-blue-500 origin-top"
              initial={{ scaleY: 0 }}
              animate={{ 
                scaleY: updatedCheckpoints.filter(cp => cp.completed).length / updatedCheckpoints.length 
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </div>
          
          <div className="space-y-6 pl-8">
            {updatedCheckpoints.map((checkpoint, index) => {
              const isActive = index === activeCheckpointIndex;
              const isCompleted = checkpoint.completed;
              const isLast = index === updatedCheckpoints.length - 1;
              
              return (
                <motion.div 
                  key={checkpoint.id}
                  className={`flex items-start relative group ${isLast ? 'pb-0' : 'pb-6'}`}
                  initial={false}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Checkpoint Circle */}
                  <motion.div 
                    className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full relative z-10 ${
                      isCompleted 
                        ? 'bg-green-50 border-2 border-green-200' 
                        : isActive 
                          ? 'bg-blue-50 border-2 border-blue-200' 
                          : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {renderCheckpointIcon(checkpoint, isActive, isCompleted)}
                    
                    {checkpoint.isNewlyCompleted && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-green-100 opacity-0"
                        initial={{ scale: 0.5, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: 1 }}
                      />
                    )}
                  </motion.div>
                  <motion.div 
                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full relative z-10 ${
                      isCompleted ? 'bg-green-100 text-green-600' : 
                      isActive ? 'bg-blue-100 text-blue-600' : 
                      'bg-gray-100 text-gray-400'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {checkpoint.isNewlyCompleted && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-green-100 opacity-0"
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <AnimatePresence>
                      {isCompleted ? (
                        <motion.span
                          key="completed"
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className="relative z-10"
                        >
                          {checkpoint.icon}
                        </motion.span>
                      ) : (
                        <span className="relative z-10">
                          {checkpoint.icon}
                        </span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  {/* Content */}
                  <div className="ml-4 flex-1">
                    <motion.div 
                      className="flex items-center"
                      initial={false}
                      animate={{
                        x: isCompleted ? 2 : 0,
                      }}
                      transition={{ 
                        type: 'spring',
                        stiffness: 500,
                        damping: 30
                      }}
                    >
                      <motion.span 
                        className={`text-sm font-medium ${
                          isCompleted 
                            ? 'text-green-700' 
                            : isActive 
                              ? 'text-blue-800 font-semibold' 
                              : 'text-gray-600'
                        }`}
                      >
                        {checkpoint.label}
                        {isActive && (
                          <motion.span 
                            className="ml-1.5 inline-block h-2 w-2 rounded-full bg-blue-600"
                            animate={{ 
                              scale: [1, 1.4, 1],
                              opacity: [0.7, 1, 0.7],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        )}
                      </motion.span>
                      
                      {isActive && (
                        <motion.span 
                          className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            type: 'spring', 
                            stiffness: 500, 
                            damping: 30,
                            delay: 0.2
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 animate-pulse"></span>
                          In Progress
                        </motion.span>
                      )}
                      
                      {isCompleted && (
                        <motion.span 
                          className="ml-2 text-green-500 flex items-center text-xs"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                            delay: 0.2
                          }}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Completed
                        </motion.span>
                      )}
                    </motion.div>
                    
                    <motion.p 
                      className={`text-xs mt-1 ${
                        isCompleted 
                          ? 'text-green-600' 
                          : isActive 
                            ? 'text-blue-600' 
                            : 'text-gray-500'
                      }`}
                      initial={false}
                      animate={{
                        x: isCompleted ? 2 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {checkpoint.description}
                    </motion.p>
                    
                    <motion.div 
                      className={`text-xs mt-1 ${
                        isCompleted 
                          ? 'text-green-600' 
                          : isActive 
                            ? 'text-blue-700 font-medium' 
                            : 'text-gray-500'
                      }`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {checkpoint.timestamp ? (
                        <>
                          <span className="font-medium">
                            {isCompleted ? 'Completed: ' : isActive ? 'In progress since: ' : 'Pending: '}
                          </span>
                          {format(new Date(checkpoint.timestamp), 'MMM d, yyyy h:mm a')}
                        </>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </motion.div>
                  </div>
                
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Activity Log</h3>
          <span className="text-sm text-gray-500">{ticketEvents.length} events</span>
        </div>
        
        <div className="space-y-4">
          {ticketEvents.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No activity recorded yet
            </div>
          ) : (
            ticketEvents.map((event, index) => (
              <div 
                key={event.id} 
                className={`flex ${index !== ticketEvents.length - 1 ? 'pb-4 border-b border-gray-100' : ''}`}
              >
                <div className="mr-3">
                  <EventIcon type={event.eventType} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">
                      {event.userName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatEventDate(event.timestamp)}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    {getEventContent(event)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketTrail;
