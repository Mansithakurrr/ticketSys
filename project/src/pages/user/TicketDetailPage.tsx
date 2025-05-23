import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '../../context/TicketsContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TicketStatusBadge from '../../components/tickets/TicketStatusBadge';
import TicketPriorityBadge from '../../components/tickets/TicketPriorityBadge';
import TicketTypeBadge from '../../components/tickets/TicketTypeBadge';
import TicketTrail from '../../components/tickets/TicketTrail';
import TicketActions from '../../components/tickets/TicketActions';
import CustomerFeedbackForm from '../../components/tickets/CustomerFeedbackForm';
import TextArea from '../../components/ui/TextArea';
import { ChevronLeft, Send, Paperclip, User, Clock, CalendarClock, MessageSquare, List } from 'lucide-react';
import { Ticket, Comment } from '../../types';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { getTicketById, addComment } = useTickets();
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load ticket data when component mounts or ticketId changes
  useEffect(() => {
    const loadTicket = async () => {
      if (!ticketId) {
        navigate('/tickets');
        return;
      }
      
      try {
        setIsLoading(true);
        const foundTicket = getTicketById(ticketId);
        
        if (!foundTicket) {
          navigate('/tickets');
          return;
        }
        
        // Create a safe ticket with default values
        const safeTicket: Ticket = {
          ...foundTicket,
          id: foundTicket.id,
          subject: foundTicket.subject || 'Untitled Ticket',
          description: foundTicket.description || '',
          status: foundTicket.status || 'new',
          priority: foundTicket.priority || 'medium',
          type: foundTicket.type || 'technical-support',
          userId: foundTicket.userId,
          assignedTo: foundTicket.assignedTo || null,
          department: foundTicket.department,
          attachments: foundTicket.attachments || [],
          comments: foundTicket.comments || [],
          statusHistory: foundTicket.statusHistory || [],
          sla: foundTicket.sla,
          tags: foundTicket.tags || [],
          customFields: foundTicket.customFields || {},
          createdAt: foundTicket.createdAt || new Date(),
          updatedAt: foundTicket.updatedAt || new Date(),
          closedAt: foundTicket.closedAt
        };
        
        setTicket(safeTicket);
        
        // Show feedback form if ticket is closed and no feedback exists
        if (foundTicket.status === 'closed' && !foundTicket.closedAt) {
          setShowFeedbackForm(true);
        }
      } catch (error) {
        console.error('Error loading ticket:', error);
        navigate('/tickets');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTicket();
  }, [ticketId, getTicketById, navigate]);
  
  // Format date for display
  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);
  
  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newComment.trim() || !ticket) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addComment(ticket.id, newComment, isInternal);
      setNewComment('');
      setIsInternal(false);
      
      // Refresh ticket
      const updatedTicket = getTicketById(ticket.id);
      if (updatedTicket) {
        setTicket(updatedTicket);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle ticket updates
  const handleTicketUpdate = useCallback(() => {
    if (!ticketId || !ticket) return;
    
    try {
      const updatedTicket = getTicketById(ticketId);
      if (!updatedTicket) {
        console.error('Ticket not found');
        return;
      }
      
      // Create a safe updated ticket with all required fields
      const safeUpdatedTicket: Ticket = {
        ...ticket,
        ...updatedTicket,
        id: updatedTicket.id || ticket.id,
        updatedAt: new Date()
      };
      
      // Update the ticket state with the new data
      setTicket(safeUpdatedTicket);
      
      // Show feedback form if ticket was just closed
      if (updatedTicket.status === 'closed' && !ticket.closedAt) {
        setShowFeedbackForm(true);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  }, [ticketId, ticket, getTicketById]);
  
  // Render user info for comments
  const renderUserInfo = useCallback((comment: Comment) => {
    const isAdmin = comment.userId.startsWith('admin');
    const userName = isAdmin ? 'Support Agent' : 'You';
    
    return (
      <div className="flex items-center">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${isAdmin ? 'bg-blue-500' : 'bg-gray-500'}`}>
          <User className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="font-medium">{userName}</div>
          <div className="text-xs text-gray-500">
            {formatDate(comment.createdAt)}
          </div>
        </div>
        {isAdmin && comment.isInternal && (
          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            Internal
          </span>
        )}
      </div>
    );
  }, [formatDate]);

  // Show loading state while ticket is being loaded
  if (isLoading || !ticket) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // Check if the current user is the ticket owner
  const isUserTicket = currentUser.id === ticket.userId;
  
  // Determine if we should show the feedback form
  const shouldShowFeedbackForm = ticket.status === 'closed' && !ticket.closedAt && isUserTicket && !showFeedbackForm;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Tickets
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-0">
            {ticket.subject}
          </h1>
          <div className="flex items-center space-x-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            <TicketTypeBadge type={ticket.type} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details with Tabs */}
          <Card>
            <CardBody>
              <Tabs value={activeTab} onChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    <List className="h-4 w-4 mr-2" />
                    Activity
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-4">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{ticket.description}</p>
                  </div>
                  
                  {ticket.attachments.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Paperclip className="h-4 w-4 mr-1" />
                        Attachments ({ticket.attachments.length})
                      </h4>
                      <ul className="space-y-2">
                        {ticket.attachments.map(attachment => (
                          <li key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm">{attachment.name}</span>
                            </div>
                            <a
                              href={attachment.url}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="activity" className="mt-4">
                  <TicketTrail ticketId={ticket.id} />
                </TabsContent>
              </Tabs>
            </CardBody>
          </Card>
          
          {/* Comments Section */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-800">
                Conversation
              </h3>
            </CardHeader>
            
            <CardBody>
              <div className="space-y-4">
                {ticket.comments
                  .filter(comment => !comment.isInternal || isAdmin)
                  .map(comment => (
                    <div key={comment.id} className="border-b pb-4 last:border-0 last:pb-0">
                      {renderUserInfo(comment)}
                      <div className="mt-2 text-gray-700">
                        {comment.content}
                      </div>
                    </div>
                  ))}
                
                {ticket.comments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No comments yet. Be the first to add one!</p>
                )}
              </div>
            </CardBody>
            
            <CardFooter className="border-t border-gray-100 px-6 py-4">
              <form onSubmit={handleSubmitComment} className="w-full">
                <div className="mb-3">
                  <TextArea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Type your comment here..."
                    rows={3}
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="internal-note"
                      checked={isInternal}
                      onChange={e => setIsInternal(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!isAdmin}
                    />
                    <label
                      htmlFor="internal-note"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Mark as internal note (only visible to staff)
                    </label>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    rightIcon={<Send className="h-4 w-4" />}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </form>
            </CardFooter>
          </Card>
          
          {/* Customer Feedback Form */}
          {shouldShowFeedbackForm && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Share Your Feedback</h2>
              </CardHeader>
              <CardBody>
                <CustomerFeedbackForm 
                  ticketId={ticket.id} 
                  onFeedbackSubmitted={() => setShowFeedbackForm(false)} 
                />
              </CardBody>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Ticket Actions */}
          <Card>
            <CardBody>
              <TicketActions 
                ticket={ticket} 
                onUpdate={handleTicketUpdate} 
              />
            </CardBody>
          </Card>
          
          {/* Ticket Trail */}
          <Card>
            <CardHeader>
              <h3 className="font-medium text-gray-900">Activity Log</h3>
            </CardHeader>
            <CardBody>
              <TicketTrail ticketId={ticketId!} />
            </CardBody>
          </Card>
          
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <h3 className="font-medium text-gray-900">Ticket Details</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Status
                  </div>
                  <TicketStatusBadge status={ticket.status} />
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Priority
                  </div>
                  <TicketPriorityBadge priority={ticket.priority} />
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Type
                  </div>
                  <TicketTypeBadge type={ticket.type} />
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">
                      Submitted: {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                  
                  {ticket.updatedAt > ticket.createdAt && (
                    <div className="flex items-center mt-2">
                      <CalendarClock className="h-4 w-4 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-600">
                        Last Updated: {formatDate(ticket.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
                
                {isAdmin && (
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Assignment
                    </div>
                    <div>
                      {ticket.assignedTo ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Assigned
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
          
          <div className="mt-6">
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/tickets')}
            >
              Back to Tickets
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
