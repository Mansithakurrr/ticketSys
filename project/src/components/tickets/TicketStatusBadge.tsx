import React from 'react';
import { TicketStatus } from '../../types';
import Badge from '../ui/Badge';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const statusConfig = {
    'new': {
      variant: 'primary' as const,
      label: 'New',
    },
    'in-progress': {
      variant: 'warning' as const,
      label: 'In Progress',
    },
    'on-hold': {
      variant: 'default' as const,
      label: 'On Hold',
    },
    'resolved': {
      variant: 'success' as const,
      label: 'Resolved',
    },
    'closed': {
      variant: 'default' as const,
      label: 'Closed',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export default TicketStatusBadge;