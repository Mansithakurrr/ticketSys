import React from 'react';
import { useNavigate } from 'react-router-dom';
import TicketForm from '../../components/tickets/TicketForm';

const SubmitTicketPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate('/tickets');
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Submit a New Ticket</h1>
        <p className="mt-1 text-gray-600">
          Fill out the form below to create a new support ticket
        </p>
      </div>
      
      <TicketForm onSuccess={handleSuccess} />
    </div>
  );
};

export default SubmitTicketPage;