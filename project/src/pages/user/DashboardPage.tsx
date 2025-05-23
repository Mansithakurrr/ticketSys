import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketsContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TicketCard from '../../components/tickets/TicketCard';
import { Plus, TicketIcon, AlertCircle, CheckCircle } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { tickets, notifications } = useTickets();
  const navigate = useNavigate();
  
  // Get user's tickets
  const userTickets = currentUser
    ? tickets.filter(ticket => ticket.userId === currentUser.id)
    : [];
  
  // Get recent tickets
  const recentTickets = [...userTickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // Get tickets by status
  const openTickets = userTickets.filter(ticket => 
    ticket.status === 'new' || ticket.status === 'in-progress' || ticket.status === 'on-hold'
  );
  
  const resolvedTickets = userTickets.filter(ticket => 
    ticket.status === 'resolved' || ticket.status === 'closed'
  );
  
  // Get user notifications
  const userNotifications = currentUser
    ? notifications
        .filter(notification => notification.userId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {currentUser?.name || 'User'}
        </h1>
        <p className="mt-1 text-lg text-gray-600">
          Here's an overview of your support tickets
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody className="flex items-center p-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <TicketIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Tickets</h3>
              <p className="text-3xl font-bold text-gray-700">{userTickets.length}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex items-center p-6">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Open Tickets</h3>
              <p className="text-3xl font-bold text-gray-700">{openTickets.length}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex items-center p-6">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Resolved Tickets</h3>
              <p className="text-3xl font-bold text-gray-700">{resolvedTickets.length}</p>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Recent Tickets</h2>
              <Link to="/tickets">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            
            <CardBody>
              {recentTickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">You haven't submitted any tickets yet.</p>
                  <Link to="/submit" className="mt-2 inline-block">
                    <Button
                      variant="primary"
                      leftIcon={<Plus className="h-4 w-4" />}
                      className="mt-2"
                    >
                      Submit Your First Ticket
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTickets.map(ticket => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Recent Notifications</h2>
            </CardHeader>
            
            <CardBody>
              {userNotifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {userNotifications.map(notification => (
                    <li key={notification.id} className="py-3">
                      <div className={`${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
          
          <div className="mt-6">
            <Link to="/submit">
              <Button
                variant="primary"
                fullWidth
                leftIcon={<Plus className="h-5 w-5" />}
              >
                Submit New Ticket
              </Button>
            </Link>
            
            {isAdmin && (
              <Link to="/admin" className="mt-4 block">
                <Button
                  variant="outline"
                  fullWidth
                >
                  Go to Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;