import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Simple Card wrapper used throughout the dashboard for stat cards,
 * tables, and panels. Uses the `.glass` utility (frosted-glass
 * background + blur + soft border) for the glassmorphic theme.
 */
const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`glass rounded-2xl ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
