import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 backdrop-blur-lg px-4 py-3 rounded-lg border border-white/10 shadow-xl">
        <p className="text-gray-400 text-sm mb-1">
          {new Date(label).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
        <p className="text-white font-medium">
          Score: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

const PerformanceChart = ({ data }) => {
  // Sort data in ascending order by date
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-8 rounded-2xl border border-white/10 shadow-xl mt-5">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Performance Timeline</h3>
        <p className="text-gray-400 text-sm">Track your interview performance over time</p>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart 
          data={sortedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.1)" 
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.5)"
            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            domain={[0, 10]}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ 
              fill: '#8b5cf6',
              strokeWidth: 2,
              r: 4,
              stroke: '#1a1a1a'
            }}
            activeDot={{ 
              r: 6,
              stroke: '#8b5cf6',
              strokeWidth: 2,
              fill: '#1a1a1a'
            }}
            fill="url(#scoreGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;