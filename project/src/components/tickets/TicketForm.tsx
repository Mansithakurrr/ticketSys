import React, { useState } from 'react';
import { TicketType, TicketPriority } from '../../types';
import { useTickets } from '../../context/TicketsContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../ui/Card';
import { PaperclipIcon, Send } from 'lucide-react';

interface TicketFormProps {
  onSuccess?: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ onSuccess }) => {
  const { createTicket } = useTickets();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    type: 'technical-support' as TicketType,
    priority: 'medium' as TicketPriority,
    subject: '',
    description: '',
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const fileList = Array.from(e.target.files);
    
    // Validate file size (10MB max per file)
    const invalidFiles = fileList.filter(file => file.size > 10 * 1024 * 1024);
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        files: `The following files exceed the 10MB limit: ${invalidFiles.map(f => f.name).join(', ')}`,
      }));
      return;
    }
    
    // Validate max number of files (5 max)
    if (files.length + fileList.length > 5) {
      setErrors(prev => ({
        ...prev,
        files: 'You can upload a maximum of 5 files.',
      }));
      return;
    }
    
    setFiles(prev => [...prev, ...fileList]);
    
    // Clear file input
    e.target.value = '';
    
    // Clear file error
    if (errors.files) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.files;
        return newErrors;
      });
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length > 100) {
      newErrors.subject = 'Subject cannot exceed 100 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create ticket first
      const ticket = await createTicket({
        type: formData.type,
        priority: formData.priority,
        subject: formData.subject,
        description: formData.description,
        attachments: [],
      });
      
      // Upload files if any
      for (const file of files) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate file upload
      }
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        type: 'technical-support',
        priority: 'medium',
        subject: '',
        description: '',
      });
      setFiles([]);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to submit ticket. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-800">Submit a New Ticket</h2>
        <p className="text-gray-600 mt-1">
          Please provide the details below to create a support ticket
        </p>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Select
              label="Ticket Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={[
                { value: 'bug', label: 'Bug' },
                { value: 'feature-request', label: 'Feature Request' },
                { value: 'technical-support', label: 'Technical Support' },
                { value: 'other', label: 'Other' },
              ]}
            />
            
            <Select
              label="Priority Level"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
          </div>
          
          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            error={errors.subject}
            helperText="Max 100 characters"
            className="mt-4"
            required
          />
          
          <TextArea
            label="Detailed Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            helperText="Min 50 characters. Please provide as much detail as possible."
            rows={5}
            className="mt-4"
            required
          />
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments
            </label>
            
            <div className="flex items-center">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <PaperclipIcon className="h-5 w-5 mr-2 text-gray-400" />
                Add Files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              
              <p className="ml-3 text-xs text-gray-500">
                Max 5 files, 10MB each
              </p>
            </div>
            
            {errors.files && (
              <p className="mt-1 text-sm text-red-600">{errors.files}</p>
            )}
            
            {files.length > 0 && (
              <ul className="mt-3 divide-y divide-gray-200 border border-gray-200 rounded-md">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between py-2 px-3 text-sm"
                  >
                    <div className="flex items-center">
                      <PaperclipIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="truncate">{file.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {errors.form && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              {errors.form}
            </div>
          )}
        </CardBody>
        
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            rightIcon={<Send className="h-4 w-4" />}
          >
            Submit Ticket
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TicketForm;