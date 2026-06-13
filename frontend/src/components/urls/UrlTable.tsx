import { ShortUrl } from '../../types';
import { Badge } from '../ui/Badge';
import { Copy, Edit2, Trash2, QrCode, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface UrlTableProps {
  urls: ShortUrl[];
  onEdit: (url: ShortUrl) => void;
  onDelete: (url: ShortUrl) => void;
  onShowQr: (url: ShortUrl) => void;
  onToggleActive: (url: ShortUrl) => void;
}

/**
 * UrlTable
 *
 * Renders the list of short links with key metadata and inline
 * actions (copy, edit, QR code, toggle active, delete). Designed to
 * be responsive: on small screens, less-critical columns are hidden
 * via Tailwind responsive classes, and the table scrolls horizontally
 * if needed.
 */
const UrlTable = ({ urls, onEdit, onDelete, onShowQr, onToggleActive }: UrlTableProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatus = (url: ShortUrl): { label: string; variant: 'success' | 'danger' | 'warning' } => {
    if (!url.isActive) return { label: 'Disabled', variant: 'warning' };
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return { label: 'Expired', variant: 'danger' };
    }
    return { label: 'Active', variant: 'success' };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="py-3 px-4 font-medium">Link</th>
            <th className="py-3 px-4 font-medium hidden md:table-cell">Original URL</th>
            <th className="py-3 px-4 font-medium text-center">Clicks</th>
            <th className="py-3 px-4 font-medium hidden lg:table-cell">Created</th>
            <th className="py-3 px-4 font-medium">Status</th>
            <th className="py-3 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => {
            const status = getStatus(url);
            return (
              <tr key={url._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <button
                      onClick={() => copyToClipboard(url.shortUrl)}
                      className="font-medium text-primary-600 hover:underline text-left flex items-center gap-1.5"
                      title="Click to copy"
                    >
                      {url.shortUrl.replace(/^https?:\/\//, '')}
                      <Copy size={12} className="text-gray-400" />
                    </button>
                    {url.title && <span className="text-xs text-gray-400 mt-0.5">{url.title}</span>}
                    {url.customAlias && (
                      <span className="mt-1">
                        <Badge variant="primary">Custom</Badge>
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell max-w-[260px]">
                  <a
                    href={url.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{url.originalUrl}</span>
                    <ExternalLink size={12} className="flex-shrink-0" />
                  </a>
                </td>
                <td className="py-3 px-4 text-center font-semibold text-gray-900">{url.totalClicks}</td>
                <td className="py-3 px-4 hidden lg:table-cell text-gray-500">
                  {format(new Date(url.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onToggleActive(url)}
                      title={url.isActive ? 'Disable link' : 'Enable link'}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {url.isActive ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => onShowQr(url)}
                      title="QR Code"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <QrCode size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(url)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(url)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UrlTable;
