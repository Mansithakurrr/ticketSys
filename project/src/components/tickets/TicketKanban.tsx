import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Ticket, TicketStatus } from '../../types';
import { useTickets } from '../../context/TicketsContext';
import TicketCard from './TicketCard';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { AlertCircle, Clock, CheckCircle, PauseCircle, XCircle, Loader2, ArrowLeftRight } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
// Custom hook for media queries
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
};

// Loading spinner component with accessibility attributes
const LoadingSpinner = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center p-4 space-y-2">
    <Loader2 
      className="h-6 w-6 animate-spin text-gray-400" 
      aria-hidden="true"
    />
    <span className="sr-only">{label}</span>
  </div>
);

// Empty state component
const EmptyColumnState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[200px] rounded-lg bg-gray-50 border-2 border-dashed border-gray-200">
    <ArrowLeftRight className="h-8 w-8 text-gray-300 mb-2" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

interface TicketKanbanProps {
  tickets: Ticket[];
  className?: string;
}

// Reorder utility function (moved below the imports for better organization)

const TicketKanban: React.FC<TicketKanbanProps> = ({
  tickets: propTickets,
  className = '',
}) => {
  const { updateTicketStatus } = useTickets();
  const { addToast } = useToast();
  // Use media query for responsive behavior
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Memoize the empty state message based on mobile/desktop view
  const getEmptyStateMessage = useCallback((status: string) => {
    return isMobile 
      ? `No ${status.toLowerCase()} tickets`
      : `No tickets in ${status.toLowerCase()}. Drag and drop to add.`;
  }, [isMobile]);
  const [isDragging, setIsDragging] = useState(false);
  const [updatingTickets, setUpdatingTickets] = useState<Record<string, boolean>>({});
  const [localTickets, setLocalTickets] = useState<Ticket[]>(propTickets);
  
  // Define columns configuration
  const columnsConfig = useMemo(() => [
    {
      id: 'new' as const,
      title: 'New',
      color: 'bg-blue-500',
      icon: <AlertCircle className="h-5 w-5 text-blue-600" aria-hidden="true" />,
      description: 'Newly created tickets',
    },
    {
      id: 'in-progress' as const,
      title: 'In Progress',
      color: 'bg-amber-500',
      icon: <Clock className="h-5 w-5 text-amber-600" aria-hidden="true" />,
      description: 'Tickets being worked on',
    },
    {
      id: 'on-hold' as const,
      title: 'On Hold',
      color: 'bg-purple-500',
      icon: <PauseCircle className="h-5 w-5 text-purple-600" aria-hidden="true" />,
      description: 'Temporarily paused tickets',
    },
    {
      id: 'resolved' as const,
      title: 'Resolved',
      color: 'bg-green-500',
      icon: <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />,
      description: 'Completed tickets',
    },
    {
      id: 'closed' as const,
      title: 'Closed',
      color: 'bg-gray-500',
      icon: <XCircle className="h-5 w-5 text-gray-600" aria-hidden="true" />,
      description: 'Archived tickets',
    },
  ], []);

  // Memoized reorder utility function with type safety
  const reorder = useCallback(<T,>(list: T[], startIndex: number, endIndex: number): T[] => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }, []);

  // Keep localTickets in sync with propTickets
  useEffect(() => {
    setLocalTickets(propTickets);
  }, [propTickets]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('is-dragging');
    };
  }, []);
  
  const columns: {
    id: TicketStatus;
    title: string;
    color: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      id: 'new',
      title: 'New',
      color: 'bg-blue-500',
      icon: <AlertCircle className="h-5 w-5 text-blue-600" />,
      description: 'Newly created tickets',
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: 'bg-amber-500',
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      description: 'Tickets being worked on',
    },
    {
      id: 'on-hold',
      title: 'On Hold',
      color: 'bg-purple-500',
      icon: <PauseCircle className="h-5 w-5 text-purple-600" />,
      description: 'Temporarily paused tickets',
    },
    {
      id: 'resolved',
      title: 'Resolved',
      color: 'bg-green-500',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      description: 'Completed tickets',
    },
    {
      id: 'closed',
      title: 'Closed',
      color: 'bg-gray-500',
      icon: <XCircle className="h-5 w-5 text-gray-600" />,
      description: 'Archived tickets',
    },
  ];
  
  // Memoized ticket filtering by status
  const getTicketsByStatus = useCallback((status: TicketStatus) => {
    return localTickets.filter(ticket => ticket.status === status);
  }, [localTickets]);
  
  // Memoize the column tickets to prevent unnecessary recalculations
  const columnTicketsMap = useMemo(() => {
    const map = new Map<TicketStatus, Ticket[]>();
    columnsConfig.forEach(column => {
      map.set(column.id, getTicketsByStatus(column.id));
    });
    return map;
  }, [columnsConfig, getTicketsByStatus]);
  
  // Get tickets for a specific column
  const getColumnTickets = useCallback((status: TicketStatus) => {
    return columnTicketsMap.get(status) || [];
  }, [columnTicketsMap]);
  
  // Memoize the render function for ticket items to prevent unnecessary re-renders
  const renderTicketItem = useCallback((ticket: Ticket, index: number) => (
    <Draggable 
      key={ticket.id}
      draggableId={ticket.id}
      index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`relative ${updatingTickets[ticket.id] ? 'opacity-50' : ''}`}
          style={{
            ...provided.draggableProps.style,
            marginBottom: '0.5rem',
          }}
          aria-roledescription="Press space bar to lift the ticket"
        >
          <TicketCard 
            ticket={ticket}
            className={snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}
          />
          {updatingTickets[ticket.id] && (
            <div 
              className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-md"
              aria-live="polite"
              aria-busy="true"
            >
              <LoadingSpinner />
            </div>
          )}
        </div>
      )}
    </Draggable>
  ), [updatingTickets]);
  
  const handleDragStart = () => {
    setIsDragging(true);
    // Add dragging class to body for global styling
    document.body.classList.add('is-dragging');
  };
  
  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    document.body.classList.remove('is-dragging');

    const { source, destination, draggableId } = result;
    
    // Ignore if dropped outside a droppable area
    if (!destination) {
      return;
    }
    
    // Ignore if dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    // If same column, just reorder
    if (source.droppableId === destination.droppableId) {
      setLocalTickets(prev =>
        // filter to only this status, reorder those, then merge back
        columns
          .map(col => {
            if (col.id !== source.droppableId) {
              return prev.filter(t => t.status === col.id);
            }
            const same = prev.filter(t => t.status === source.droppableId);
            return reorder(same, source.index, destination.index);
          })
          .flat()
      );
      return;
    }

    // Different column → status change
    const newStatus = destination.droppableId as TicketStatus;
    const ticketId = draggableId.startsWith('ticket-') ? draggableId : `ticket-${draggableId}`;
    
    // Optimistically update local state
    setLocalTickets(prev =>
      prev.map(t =>
        t.id === ticketId ? { ...t, status: newStatus } : t
      )
    );
    setUpdatingTickets(prev => ({ ...prev, [ticketId]: true }));

    try {
      await updateTicketStatus(ticketId, newStatus);
      addToast(`Ticket status updated to "${newStatus}"`, 'success');
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      addToast('Failed to update ticket status', 'error');
      // Roll back on error
      setLocalTickets(propTickets);
    } finally {
      setUpdatingTickets(prev => ({ ...prev, [ticketId]: false }));
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div 
        className={`flex-1 flex flex-col overflow-hidden ${className}`}
        role="region" 
        aria-label="Ticket Management Board"
      >
        <DragDropContext 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto">
            <div className="inline-flex h-full min-w-max px-4 pb-4 gap-4">
              {columnsConfig.map(column => {
                const columnTickets = getColumnTickets(column.id);
                const ticketCount = columnTickets.length;
                
                return (
                  <div 
                    key={column.id} 
                    className="w-80 flex flex-col h-full"
                    role="list"
                    aria-label={`${column.title} tickets`}
                  >
                    <div className={`${column.color} px-4 py-3 rounded-t-lg`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {column.icon}
                          <h3 className="font-semibold text-white ml-2">
                            {column.title}
                          </h3>
                        </div>
                        <span 
                          className="bg-white bg-opacity-30 text-white text-sm px-2 py-0.5 rounded-full"
                          aria-label={`${ticketCount} ${ticketCount === 1 ? 'ticket' : 'tickets'}`}
                        >
                          {ticketCount}
                        </span>
                      </div>
                    </div>
                    
                    <Droppable droppableId={column.id} type="ticket">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex-1 bg-gray-50 rounded-b-lg p-2 ${isDragging ? 'ring-2 ring-blue-200' : ''}`}
                          style={{
                            // Set a fixed height for the droppable area
                            height: 'calc(100vh - 250px)',
                            minHeight: '200px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <div className="flex-1 overflow-y-auto -m-2 p-2">
                            {columnTickets.length === 0 ? (
                              <>
                                <EmptyColumnState message={getEmptyStateMessage(column.title)} />
                                {provided.placeholder}
                              </>
                            ) : (
                              <>
                                <div className="space-y-2">
                                  {columnTickets.map((ticket, index) => 
                                    renderTicketItem(ticket, index)
                                  )}
                                </div>
                                {provided.placeholder}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </div>
        </DragDropContext>
      </div>
      
      {/* Mobile view instructions */}
      <div className="md:hidden mt-4 text-center text-sm text-gray-500 px-4 pb-4">
        <p>Scroll horizontally to view all columns</p>
        <p>Tap and hold tickets to drag them between columns</p>
      </div>
    </div>
  );
};

export default TicketKanban;