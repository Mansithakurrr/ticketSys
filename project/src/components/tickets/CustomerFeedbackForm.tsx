import React, { useState } from 'react';
import Button from '../ui/Button';
import { Star, Send } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface CustomerFeedbackFormProps {
  ticketId: string; // Used in the API call when submitting feedback
  onFeedbackSubmitted: () => void;
}

const CustomerFeedbackForm: React.FC<CustomerFeedbackFormProps> = ({
  ticketId,
  onFeedbackSubmitted,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === null) {
      addToast('Please provide a rating before submitting feedback.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Here you would typically make an API call to submit the feedback
      // For example: await api.submitFeedback(ticketId, { rating, comment });
      console.log('Submitting feedback for ticket:', ticketId, { rating, comment });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addToast('Thank you! Your feedback has been submitted successfully.');
      onFeedbackSubmitted();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      addToast('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">How would you rate your experience?</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`p-1 ${rating && star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              onClick={() => setRating(star)}
              disabled={isSubmitting}
            >
              <Star className="h-8 w-8 fill-current" />
            </button>
          ))}
        </div>
        
        <div>
          <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700 mb-1">
            Additional comments (optional)
          </label>
          <textarea
            id="feedback-comment"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Let us know how we can improve..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="mt-4 w-full"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerFeedbackForm;
