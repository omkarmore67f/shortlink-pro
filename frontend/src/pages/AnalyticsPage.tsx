import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { analyticsApi } from '../api/analyticsApi';
import { getErrorMessage } from '../api/axiosClient';
import { DailyClick, DeviceBreakdown, ShortUrl } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'];

/**
 * AnalyticsPage
 *
 * Dedicated analytics view with:
 * - 30-day daily clicks bar chart
 * - Device type breakdown (pie chart)
 * - Browser breakdown (pie chart)
 * - Top performing links table
 */
const AnalyticsPage = () => {
  const [dailyClicks, setDailyClicks] = useState<DailyClick[]>([]);
  const [devices, setDevices] = useState<DeviceBreakdown | null>(null);
  const [topLinks, setTopLinks] = useState<ShortUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dailyRes, deviceRes, topRes] = await Promise.all([
          analyticsApi.getDailyClicks(days),
          analyticsApi.getDeviceBreakdown(),
          analyticsApi.getTopLinks(10),
        ]);
        setDailyClicks(dailyRes.data.data);
        setDevices(deviceRes.data.data);
        setTopLinks(topRes.data.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days]);

  if (loading) {
    return <Spinner fullScreen label="Loading analytics..." />;
  }

  const chartData = dailyClicks.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'MMM d'),
  }));

  const hasDeviceData = devices && devices.byDevice.length > 0;
  const hasBrowserData = devices && devices.byBrowser.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed insights into your link performance.</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="glass-input rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Daily Clicks</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} interval={Math.ceil(chartData.length / 10)} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
            <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Clicks by Device</h2>
          {hasDeviceData ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={devices!.byDevice}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {devices!.byDevice.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No click data yet" description="Device breakdown will appear once your links receive clicks." />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Clicks by Browser</h2>
          {hasBrowserData ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={devices!.byBrowser}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {devices!.byBrowser.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No click data yet" description="Browser breakdown will appear once your links receive clicks." />
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Top Performing Links</h2>
        {topLinks.length === 0 ? (
          <EmptyState title="No links yet" description="Create a short link to start tracking performance." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 px-3 font-medium">Short Link</th>
                  <th className="py-2 px-3 font-medium hidden md:table-cell">Destination</th>
                  <th className="py-2 px-3 font-medium text-right">Total Clicks</th>
                </tr>
              </thead>
              <tbody>
                {topLinks.map((url) => (
                  <tr key={url._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 px-3 font-medium text-primary-600">
                      {url.shortUrl.replace(/^https?:\/\//, '')}
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell text-gray-500 max-w-xs truncate">
                      {url.originalUrl}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                      {url.totalClicks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsPage;
