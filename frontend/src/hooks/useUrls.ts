import { useState, useEffect, useCallback } from 'react';
import { urlApi, ListUrlsParams } from '../api/urlApi';
import { getErrorMessage } from '../api/axiosClient';
import { Pagination, ShortUrl } from '../types';

/**
 * useUrls
 *
 * Encapsulates the data-fetching logic for the Links table:
 * pagination, sorting, and search state, plus loading/error states.
 * Exposes `refetch` so components can manually trigger a reload after
 * mutations (create/update/delete) without managing fetch logic
 * themselves.
 */
export const useUrls = (initialParams: ListUrlsParams = {}) => {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [params, setParams] = useState<ListUrlsParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    order: 'desc',
    ...initialParams,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUrls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await urlApi.list(params);
      setUrls(data.data);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const updateParams = (newParams: Partial<ListUrlsParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return { urls, pagination, params, updateParams, loading, error, refetch: fetchUrls };
};
