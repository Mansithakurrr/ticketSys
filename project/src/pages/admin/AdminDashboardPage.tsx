import React from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '../../context/TicketsContext';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TicketCard from '../../components/tickets/TicketCard';
import { TicketIcon, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const { tickets } = useTickets();
  
  // Get tickets by status
  const newTickets = tickets.filter(ticket => ticket.status === 'new');
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'in-progress');
  const onHoldTickets = tickets.filter(ticket => ticket.status === 'on-hold');
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved');
  const closedTickets = tickets.filter(ticket => ticket.status === 'closed');
  
  // Get urgent tickets (high priority and not closed)
  const urgentTickets = tickets.filter(
    ticket => ticket.priority === 'high' && ticket.status !== 'closed'
  );
  
  // Get unassigned tickets
  const unassignedTickets = tickets.filter(
    ticket => !ticket.assignedTo && ticket.status !== 'closed'
  );
  
  // Get recent tickets
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-lg text-gray-600">
          Manage and monitor all support tickets
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody className="flex items-center p-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <TicketIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Tickets</h3>
              <p className="text-3xl font-bold text-gray-700">{tickets.length}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex items-center p-6">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
              <p className="text-3xl font-bold text-gray-700">
                {newTickets.length + inProgressTickets.length + onHoldTickets.length}
              </p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex items-center p-6">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Resolved</h3>
              <p className="text-3xl font-bold text-gray-700">
                {resolvedTickets.length + closedTickets.length}
              </p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex items-center p-6">
            <div className="bg-red-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Urgent</h3>
              <p className="text-3xl font-bold text-gray-700">{urgentTickets.length}</p>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Recent Tickets</h2>
              <Link to="/admin/tickets">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            
            <CardBody>
              <div className="space-y-4">
                {recentTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </CardBody>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800">Ticket Status</h2>
              </CardHeader>
              
              <CardBody>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New</span>
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-600 mr-2"></div>
                      <span className="font-medium">{newTickets.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">In Progress</span>
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500 mr-2"></div>
                      <span className="font-medium">{inProgressTickets.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">On Hold</span>
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-purple-500 mr-2"></div>
                      <span className="font-medium">{onHoldTickets.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Resolved</span>
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                      <span className="font-medium">{resolvedTickets.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Closed</span>
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-500 mr-2"></div>
                      <span className="font-medium">{closedTickets.length}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800">Unassigned Tickets</h2>
              </CardHeader>
              
              <CardBody>
                {unassignedTickets.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No unassigned tickets
                  </p>
                ) : (
                  <div className="space-y-4">
                    {unassignedTickets.slice(0, 5).map(ticket => (
                      <div key={ticket.id} className="flex justify-between items-center">
                        <div className="truncate max-w-[250px]">
                          <Link
                            to={`/admin/tickets/${ticket.id}`}
                            className="text-blue-600 hover:text-blue-800 truncate"
                          >
                            {ticket.subject}
                          </Link>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                          <Button size="sm" variant="outline" className="ml-2">
                            Assign
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Urgent Tickets</h2>
            </CardHeader>
            
            <CardBody>
              {urgentTickets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No urgent tickets
                </p>
              ) : (
                <div className="space-y-4">
                  {urgentTickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="p-3 bg-red-50 rounded-md">
                      <Link
                        to={`/admin/tickets/${ticket.id}`}
                        className="font-medium text-red-700 hover:text-red-800"
                      >
                        {ticket.subject}
                      </Link>
                      <div className="flex justify-between items-center mt-2 text-xs text-red-600">
                        <span>Status: {ticket.status}</span>
                        <span>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          
          <div className="mt-6 space-y-4">
            <Link to="/admin/tickets">
              <Button variant="primary" fullWidth>
                View All Tickets
              </Button>
            </Link>
            
            <Link to="/admin/kanban">
              <Button variant="outline" fullWidth>
                Kanban Board
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;