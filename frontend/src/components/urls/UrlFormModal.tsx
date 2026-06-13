import { useState, FormEvent, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { urlApi } from '../../api/urlApi';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { ShortUrl } from '../../types';

interface UrlFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUrl?: ShortUrl | null;
}

/**
 * UrlFormModal
 *
 * Single modal that handles BOTH creation and editing of short URLs,
 * switching its fields/labels based on whether `editingUrl` is passed.
 * Reusing one component avoids duplicating form layout/validation.
 */
const UrlFormModal = ({ isOpen, onClose, onSuccess, editingUrl }: UrlFormModalProps) => {
  const isEditMode = !!editingUrl;

  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingUrl) {
      setOriginalUrl(editingUrl.originalUrl);
      setTitle(editingUrl.title || '');
      setExpiresAt(editingUrl.expiresAt ? editingUrl.expiresAt.split('T')[0] : '');
      setCustomAlias(editingUrl.customAlias || '');
    } else {
      setOriginalUrl('');
      setCustomAlias('');
      setTitle('');
      setExpiresAt('');
    }
    setErrors({});
  }, [editingUrl, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!originalUrl.trim()) {
      newErrors.originalUrl = 'URL is required';
    } else {
      try {
        new URL(originalUrl);
      } catch {
        newErrors.originalUrl = 'Please enter a valid URL including http:// or https://';
      }
    }

    if (!isEditMode && customAlias && !/^[a-zA-Z0-9-_]{3,30}$/.test(customAlias)) {
      newErrors.customAlias =
        'Alias must be 3-30 characters: letters, numbers, hyphens, underscores only';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditMode && editingUrl) {
        await urlApi.update(editingUrl._id, {
          originalUrl,
          title: title || undefined,
          expiresAt: expiresAt || null,
        });
        toast.success('Link updated successfully');
      } else {
        await urlApi.create({
          originalUrl,
          customAlias: customAlias || undefined,
          title: title || undefined,
          expiresAt: expiresAt || undefined,
        });
        toast.success('Short link created successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Link' : 'Create New Link'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Destination URL"
          name="originalUrl"
          type="text"
          placeholder="https://example.com/my-long-url"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          error={errors.originalUrl}
        />

        <Input
          label="Title (optional)"
          name="title"
          type="text"
          placeholder="My awesome campaign link"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />

        {!isEditMode && (
          <Input
            label="Custom alias (optional)"
            name="customAlias"
            type="text"
            placeholder="my-custom-name"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            error={errors.customAlias}
            hint="Leave blank to auto-generate a short code"
          />
        )}

        <Input
          label="Expiration date (optional)"
          name="expiresAt"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={submitting}>
            {isEditMode ? 'Save Changes' : 'Create Link'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UrlFormModal;
