import { ReactNode } from 'react';
import { Link2Off } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/**
 * Reusable empty-state UI shown when a list (links, search results,
 * activity feed) has no data - keeps the dashboard feeling polished
 * rather than showing a blank table.
 */
const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="rounded-full bg-gray-100 p-3 mb-4 text-gray-400">
        {icon || <Link2Off size={28} />}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
