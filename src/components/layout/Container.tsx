import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  id,
}) => {
  return (
    <div id={id} className={`max-w-5xl mx-auto px-5 sm:px-8 w-full ${className}`}>
      {children}
    </div>
  );
};
