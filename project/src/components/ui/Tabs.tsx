import * as React from 'react';

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const Tabs = ({ value, onChange, className = '', children, ...props }: TabsProps) => {
  return (
    <div className={`tabs ${className}`} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement, {
            'data-active-value': value,
            onChange,
          });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  )
);
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps & { activeValue?: string; onChange?: (value: string) => void }>(
  ({ value, activeValue, onChange, className = '', children, ...props }, ref) => {
    const isActive = activeValue === value;
    
    return (
      <button
        ref={ref}
        className={`flex items-center justify-center flex-1 h-10 rounded-md text-sm font-medium transition-colors ${
          isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        } ${className}`}
        onClick={() => onChange?.(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps & { activeValue?: string }>(
  ({ value, activeValue, className = '', children, ...props }, ref) => {
    const isActive = activeValue === value;
    
    return isActive ? (
      <div
        ref={ref}
        role="tabpanel"
        className={`mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
        {...props}
      >
        {children}
      </div>
    ) : null;
  }
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
