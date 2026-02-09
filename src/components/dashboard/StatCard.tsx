import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'destructive';
}

const variants = {
  default: {
    icon: 'bg-muted text-muted-foreground',
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
  },
  success: {
    icon: 'bg-success-muted text-success',
  },
  warning: {
    icon: 'bg-warning-muted text-warning',
  },
  info: {
    icon: 'bg-blue-100 text-blue-600',
  },
  destructive: {
    icon: 'bg-destructive-muted text-destructive',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const variantStyles = variants[variant] || variants.default;

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-muted-foreground font-normal"> vs last month</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('stat-card-icon', variantStyles.icon)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
