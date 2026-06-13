import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'neutral' | 'primary';
}

const badgeStyles: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  neutral: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  primary: 'bg-primary-50 text-primary-700 ring-primary-600/20',
};

/**
 * Small pill-shaped badge used for status labels (Active/Expired/Custom).
 */
export const Badge = ({ children, variant = 'neutral' }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeStyles[variant]}`}
    >
      {children}
    </span>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  subtext?: string;
}

/**
 * Stat card used on the dashboard overview (Total Links, Total Clicks,
 * Active Links, New This Week).
 */
export const StatCard = ({ label, value, icon, iconBg = 'bg-primary-50 text-primary-600', subtext }: StatCardProps) => {
  return (
    <div className="glass rounded-2xl p-5 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="mt-1 text-xs text-gray-400">{subtext}</p>}
      </div>
      <div className={`rounded-lg p-2.5 ${iconBg} backdrop-blur-sm`}>{icon}</div>
    </div>
  );
};
