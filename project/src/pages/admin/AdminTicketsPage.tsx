import React from 'react';
import { useTickets } from '../../context/TicketsContext';
import TicketList from '../../components/tickets/TicketList';

const AdminTicketsPage: React.FC = () => {
  const { tickets } = useTickets();
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Tickets</h1>
        <p className="mt-1 text-gray-600">
          View and manage all support tickets
        </p>
      </div>
      
      <TicketList tickets={tickets} />
    </div>
  );
};

export default AdminTicketsPage;