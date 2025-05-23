import React from 'react';
import { Ticket } from '../../types';
import { Card, CardBody } from '../ui/Card';
import TicketStatusBadge from './TicketStatusBadge';
import TicketPriorityBadge from './TicketPriorityBadge';
import TicketTypeBadge from './TicketTypeBadge';
import { Clock, Paperclip, MessageSquare, User, GripVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  className?: string;
  dragHandleProps?: any; // Using any to be compatible with react-beautiful-dnd's DragHandleProps
  isDragging?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onClick,
  className = '',
  dragHandleProps,
  isDragging = false,
}) => {
  const { isAdmin } = useAuth();
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  return (
    <Card 
      className={`transition-all cursor-pointer ${isDragging ? 'shadow-xl ring-2 ring-blue-400' : 'hover:shadow-lg'} ${className}`}
      onClick={onClick}
    >
      <CardBody className="relative">
        {/* Drag handle */}
        <div 
          {...dragHandleProps}
          className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-grab active:cursor-grabbing z-20"
          onClick={(e) => {
            e.stopPropagation();
            if (dragHandleProps?.onClick) {
              dragHandleProps.onClick(e);
            }
          }}
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex flex-wrap justify-between gap-2 mb-2">
          <div className="flex gap-2">
            <TicketTypeBadge type={ticket.type} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>
        
        <Link to={`/tickets/${ticket.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
            {ticket.subject}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {ticket.description}
        </p>
        
        <div className="flex flex-wrap justify-between text-xs text-gray-500 gap-y-2">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Opened {formatDate(ticket.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {ticket.attachments.length > 0 && (
              <div className="flex items-center">
                <Paperclip className="h-3 w-3 mr-1" />
                <span>{ticket.attachments.length}</span>
              </div>
            )}
            
            {ticket.comments.length > 0 && (
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{ticket.comments.length}</span>
              </div>
            )}
            
            {isAdmin && (
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span>{ticket.assignedTo ? 'Assigned' : 'Unassigned'}</span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TicketCard;