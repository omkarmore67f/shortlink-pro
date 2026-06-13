import { useEffect, useState } from 'react';
import { Link2, MousePointerClick, CheckCircle2, TrendingUp, Plus } from 'lucide-react';
import { StatCard } from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { analyticsApi } from '../api/analyticsApi';
import { getErrorMessage } from '../api/axiosClient';
import { AnalyticsSummary, ClickEvent, DailyClick, ShortUrl } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import UrlFormModal from '../components/urls/UrlFormModal';

/**
 * DashboardOverviewPage
 *
 * The landing page of the authenticated dashboard. Combines summary
 * stat cards, a 30-day click trend chart, top performing links, and
 * a recent activity feed - giving users an at-a-glance view of their
 * link performance.
 */
const DashboardOverviewPage = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyClicks, setDailyClicks] = useState<DailyClick[]>([]);
  const [topLinks, setTopLinks] = useState<ShortUrl[]>([]);
  const [recentActivity, setRecentActivity] = useState<ClickEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, dailyRes, topRes, activityRes] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getDailyClicks(30),
        analyticsApi.getTopLinks(5),
        analyticsApi.getRecentActivity(8),
      ]);

      setSummary(summaryRes.data.data);
      setDailyClicks(dailyRes.data.data);
      setTopLinks(topRes.data.data);
      setRecentActivity(activityRes.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <Spinner fullScreen label="Loading dashboard..." />;
  }

  const chartData = dailyClicks.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'MMM d'),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's how your links are performing.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus size={16} />
          Create Link
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Links"
          value={summary?.totalLinks ?? 0}
          icon={<Link2 size={20} />}
        />
        <StatCard
          label="Total Clicks"
          value={summary?.totalClicks ?? 0}
          icon={<MousePointerClick size={20} />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Active Links"
          value={summary?.activeLinks ?? 0}
          icon={<CheckCircle2 size={20} />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="New This Week"
          value={summary?.linksCreatedLast7Days ?? 0}
          icon={<TrendingUp size={20} />}
          iconBg="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Click Trend Chart */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Click Activity (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} interval={Math.ceil(chartData.length / 8)} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} fill="url(#colorClicks)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Links */}
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Top Performing Links</h2>
          {topLinks.length === 0 ? (
            <EmptyState title="No links yet" description="Create your first short link to see it here." />
          ) : (
            <div className="space-y-3">
              {topLinks.map((url, idx) => (
                <div key={url._id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 h-7 w-7 rounded-full bg-primary-50 text-primary-600 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary-600 truncate">
                        {url.shortUrl.replace(/^https?:\/\//, '')}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{url.title || url.originalUrl}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {url.totalClicks} clicks
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <EmptyState title="No activity yet" description="Click events will appear here once your links get traffic." />
          ) : (
            <div className="space-y-3">
              {recentActivity.map((event) => (
                <div key={event._id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.url?.title || event.url?.shortCode || 'Unknown link'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {event.device} &middot; {event.browser} &middot; {event.os}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {format(new Date(event.createdAt), 'MMM d, HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <UrlFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default DashboardOverviewPage;
