import React from 'react';
import { TicketPriority } from '../../types';
import Badge from '../ui/Badge';
import { AlertCircle } from 'lucide-react';

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({
  priority,
  className = '',
}) => {
  const priorityConfig = {
    'low': {
      variant: 'default' as const,
      label: 'Low',
      icon: false,
    },
    'medium': {
      variant: 'warning' as const,
      label: 'Medium',
      icon: false,
    },
    'high': {
      variant: 'danger' as const,
      label: 'High',
      icon: true,
    },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} className={className}>
      {config.icon && <AlertCircle className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
};

export default TicketPriorityBadge;