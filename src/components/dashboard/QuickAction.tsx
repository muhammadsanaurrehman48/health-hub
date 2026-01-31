import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface QuickActionProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  to: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon: Icon,
  to,
}) => {
  return (
    <Link to={to} className="quick-action group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="text-center">
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </Link>
  );
};
