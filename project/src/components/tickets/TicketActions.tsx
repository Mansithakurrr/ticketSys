import React, { useState } from 'react';
import { Ticket, TicketStatus, TicketPriority } from '../../types';
import Select from '../ui/Select';
import { useToast } from '../../hooks/useToast';
import { useTickets } from '../../context/TicketsContext';

interface TicketActionsProps {
  ticket: Ticket;
  onUpdate?: () => void;
}

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const TicketActions: React.FC<TicketActionsProps> = ({ ticket, onUpdate }) => {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState('');
  const { addToast } = useToast();
  const { updateTicket } = useTickets();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TicketStatus;
    const updates: Partial<Ticket> = { status: newStatus };
    
    if (newStatus === 'closed') {
      updates.closedAt = new Date();
    }
    
    try {
      setIsSaving(true);
      await updateTicket(ticket.id, updates);
      
      setStatus(newStatus);
      addToast(`Status updated to ${newStatus}`);
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      addToast('Failed to update ticket status. Please try again.');
    } finally {
      setIsSaving(false);
      setComment('');
    }
  };

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as TicketPriority;
    try {
      setIsSaving(true);
      await updateTicket(ticket.id, { priority: newPriority } as Partial<Ticket>);
      
      setPriority(newPriority);
      addToast(`Priority updated to ${newPriority}`);
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update ticket priority:', error);
      addToast('Failed to update ticket priority. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
        <Select
          value={status}
          onChange={handleStatusChange}
          options={statusOptions}
          disabled={isSaving}
          className="w-full"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
        <Select
          value={priority}
          onChange={handlePriorityChange}
          options={priorityOptions}
          disabled={isSaving}
          className="w-full"
        />
      </div>

      {(status === 'resolved' || status === 'closed') && (
        <div className="space-y-2">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Add a comment (required for status changes)
          </label>
          <textarea
            id="comment"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Add details about this status change..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSaving}
          />
        </div>
      )}
    </div>
  );
};

export default TicketActions;
