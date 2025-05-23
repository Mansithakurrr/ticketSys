import React from 'react';
import { TicketType } from '../../types';
import Badge from '../ui/Badge';
import { Bug, Lightbulb, HelpCircle, Folder } from 'lucide-react';

interface TicketTypeBadgeProps {
  type: TicketType;
  className?: string;
}

const TicketTypeBadge: React.FC<TicketTypeBadgeProps> = ({
  type,
  className = '',
}) => {
  const typeConfig = {
    'bug': {
      variant: 'danger' as const,
      label: 'Bug',
      icon: <Bug className="w-3 h-3 mr-1" />,
    },
    'feature-request': {
      variant: 'primary' as const,
      label: 'Feature Request',
      icon: <Lightbulb className="w-3 h-3 mr-1" />,
    },
    'technical-support': {
      variant: 'success' as const,
      label: 'Technical Support',
      icon: <HelpCircle className="w-3 h-3 mr-1" />,
    },
    'other': {
      variant: 'default' as const,
      label: 'Other',
      icon: <Folder className="w-3 h-3 mr-1" />,
    },
  };

  const config = typeConfig[type];

  return (
    <Badge variant={config.variant} className={className}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default TicketTypeBadge;