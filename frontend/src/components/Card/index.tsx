import type { ReactNode, FC } from 'react';
import './Card.css';

export interface CardProps {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const Card: FC<CardProps> = ({ header, children, footer, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
