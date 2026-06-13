import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import UrlTable from '../components/urls/UrlTable';
import UrlFormModal from '../components/urls/UrlFormModal';
import QrCodeModal from '../components/urls/QrCodeModal';
import { ConfirmDialog, Pagination } from '../components/ui/ConfirmDialog';
import { useUrls } from '../hooks/useUrls';
import { useDebounce } from '../hooks/useDebounce';
import { ShortUrl } from '../types';
import { urlApi } from '../api/urlApi';
import { getErrorMessage } from '../api/axiosClient';
import toast from 'react-hot-toast';

/**
 * LinksPage
 *
 * Main "My Links" management page: search, sort, paginate, create,
 * edit, toggle active state, view QR codes, and delete short links.
 */
const LinksPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const { urls, pagination, params, updateParams, loading, refetch } = useUrls();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<ShortUrl | null>(null);
  const [qrUrl, setQrUrl] = useState<ShortUrl | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<ShortUrl | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sync debounced search term into the fetch params
  useEffect(() => {
    updateParams({ search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleToggleActive = async (url: ShortUrl) => {
    try {
      await urlApi.update(url._id, { isActive: !url.isActive });
      toast.success(url.isActive ? 'Link disabled' : 'Link enabled');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deletingUrl) return;
    setDeleting(true);
    try {
      await urlApi.remove(deletingUrl._id);
      toast.success('Link deleted');
      setDeletingUrl(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Links</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, edit, and track all of your short links.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus size={16} />
          Create Link
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search by title, URL, or short code..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 sm:ml-auto">
            <select
              value={`${params.sortBy}-${params.order}`}
              onChange={(e) => {
                const [sortBy, order] = e.target.value.split('-') as [
                  'createdAt' | 'totalClicks' | 'title',
                  'asc' | 'desc'
                ];
                updateParams({ sortBy, order });
              }}
              className="glass-input rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="createdAt-desc">Newest first</option>
              <option value="createdAt-asc">Oldest first</option>
              <option value="totalClicks-desc">Most clicks</option>
              <option value="totalClicks-asc">Fewest clicks</option>
              <option value="title-asc">Title A-Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading links..." />
        ) : urls.length === 0 ? (
          <EmptyState
            title={searchInput ? 'No links match your search' : 'No links yet'}
            description={
              searchInput
                ? 'Try a different search term or clear your filters.'
                : 'Create your first short link to get started.'
            }
            action={
              !searchInput && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus size={16} />
                  Create Link
                </Button>
              )
            }
          />
        ) : (
          <>
            <UrlTable
              urls={urls}
              onEdit={setEditingUrl}
              onDelete={setDeletingUrl}
              onShowQr={setQrUrl}
              onToggleActive={handleToggleActive}
            />
            {pagination && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => updateParams({ page: p })}
              />
            )}
          </>
        )}
      </Card>

      <UrlFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={refetch}
      />

      <UrlFormModal
        isOpen={!!editingUrl}
        onClose={() => setEditingUrl(null)}
        onSuccess={refetch}
        editingUrl={editingUrl}
      />

      <QrCodeModal
        isOpen={!!qrUrl}
        onClose={() => setQrUrl(null)}
        urlId={qrUrl?._id || null}
        shortCode={qrUrl?.shortCode}
      />

      <ConfirmDialog
        isOpen={!!deletingUrl}
        title="Delete short link"
        message={`Are you sure you want to delete "${deletingUrl?.shortUrl}"? This action cannot be undone and all analytics data for this link will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingUrl(null)}
        isLoading={deleting}
      />
    </div>
  );
};

export default LinksPage;
