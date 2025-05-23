import React, { useState } from 'react';
import { Ticket, TicketStatus, TicketPriority, TicketType } from '../../types';
import TicketCard from './TicketCard';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TicketListProps {
  tickets: Ticket[];
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'priority-high' | 'priority-low' | 'recently-updated';

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  className = '',
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TicketPriority | 'all'>('all');
  const [filterType, setFilterType] = useState<TicketType | 'all'>('all');
  
  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    const matchesType = filterType === 'all' || ticket.type === filterType;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });
  
  // Sort tickets
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'priority-high':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'priority-low':
        const priorityOrderReverse = { high: 2, medium: 1, low: 0 };
        return priorityOrderReverse[a.priority] - priorityOrderReverse[b.priority];
      case 'recently-updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return 0;
    }
  });
  
  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };
  
  return (
    <div className={className}>
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          
          <Select
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'new', label: 'New' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'on-hold', label: 'On Hold' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as TicketStatus | 'all')}
          />
          
          <Select
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as TicketPriority | 'all')}
          />
          
          <Select
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'bug', label: 'Bug' },
              { value: 'feature-request', label: 'Feature Request' },
              { value: 'technical-support', label: 'Technical Support' },
              { value: 'other', label: 'Other' },
            ]}
            value={filterType}
            onChange={e => setFilterType(e.target.value as TicketType | 'all')}
          />
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {sortedTickets.length} tickets found
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'priority-high', label: 'Highest Priority' },
                { value: 'priority-low', label: 'Lowest Priority' },
                { value: 'recently-updated', label: 'Recently Updated' },
              ]}
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="w-44 mb-0"
            />
            {sortBy.includes('newest') || sortBy.includes('recently') ? (
              <SortDesc className="h-4 w-4 text-gray-400" />
            ) : (
              <SortAsc className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      
      {sortedTickets.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">No tickets found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your filters or create a new ticket.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => handleTicketClick(ticket.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;