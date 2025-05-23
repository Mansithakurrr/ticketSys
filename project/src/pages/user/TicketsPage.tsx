import React from 'react';
import { useTickets } from '../../context/TicketsContext';
import { useAuth } from '../../context/AuthContext';
import TicketList from '../../components/tickets/TicketList';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const TicketsPage: React.FC = () => {
  const { tickets } = useTickets();
  const { currentUser } = useAuth();
  
  // Get user's tickets
  const userTickets = currentUser
    ? tickets.filter(ticket => ticket.userId === currentUser.id)
    : [];
  
  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="mt-1 text-gray-600">
            View and manage all your support tickets
          </p>
        </div>
        
        <Link to="/submit" className="mt-4 md:mt-0">
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
          >
            New Ticket
          </Button>
        </Link>
      </div>
      
      <TicketList tickets={userTickets} />
    </div>
  );
};

export default TicketsPage;