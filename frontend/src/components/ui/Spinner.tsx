import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  fullScreen?: boolean;
  label?: string;
}

/**
 * Generic loading spinner. `fullScreen` centers it in the viewport,
 * useful for route-level loading states (e.g., while verifying auth).
 */
const Spinner = ({ size = 24, fullScreen = false, label }: SpinnerProps) => {
  const content = (
    <div className="flex flex-col items-center gap-2 text-gray-500">
      <Loader2 className="animate-spin" size={size} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="flex items-center justify-center min-h-screen">{content}</div>;
  }

  return <div className="flex items-center justify-center py-10">{content}</div>;
};

export default Spinner;
