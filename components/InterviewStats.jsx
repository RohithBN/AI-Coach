import { Award, Clock, Calendar, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend }) => (
  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-purple-400" />
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl font-semibold text-white">{value}</p>
        {trend && (
          <p className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
    </div>
  </div>
);

const InterviewStats = ({ stats }) => {
    console.log("stats",stats)
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard 
        icon={Award}
        label="Average Score"
        value={`${stats.averageScore}%`}
      />
      <StatCard 
        icon={Clock}
        label="Avg. Duration"
        value={stats.averageDuration}
      />
      <StatCard 
        icon={Calendar}
        label="Total Interviews"
        value={stats.totalInterviews}
      />
      <StatCard 
        icon={TrendingUp}
        label="Completion Rate"
        value={`${stats.completionRate}%`}
      />
    </div>
  );
};

export default InterviewStats;