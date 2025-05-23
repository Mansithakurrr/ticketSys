import React from 'react';
import { useTickets } from '../../context/TicketsContext';
import TicketKanban from '../../components/tickets/TicketKanban';

// Import drag and drop library (need to install this)
// For full implementation, would need: npm install react-beautiful-dnd

const AdminKanbanPage: React.FC = () => {
  const { tickets } = useTickets();
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
        <p className="mt-1 text-gray-600">
          Manage tickets using drag-and-drop functionality
        </p>
      </div>
      
      <TicketKanban tickets={tickets} />
    </div>
  );
};

export default AdminKanbanPage;