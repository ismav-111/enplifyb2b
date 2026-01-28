import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface MessageChartProps {
  data: {
    labels: string[];
    values: number[];
    type: 'bar' | 'line' | 'pie';
  };
}

const CHART_COLORS = [
  'hsl(243, 75%, 59%)',
  'hsl(243, 60%, 70%)',
  'hsl(280, 70%, 60%)',
  'hsl(220, 60%, 55%)',
  'hsl(243, 50%, 50%)',
];

export const MessageChart = ({ data }: MessageChartProps) => {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
  }));

  const tooltipStyle = {
    contentStyle: { 
      backgroundColor: 'hsl(0, 0%, 100%)',
      border: '1px solid hsl(225, 20%, 90%)',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
      padding: '12px 16px',
    },
    labelStyle: {
      fontWeight: 600,
      marginBottom: '4px',
    }
  };

  const renderChart = () => {
    if (data.type === 'bar') {
      return (
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(243, 75%, 59%)" />
              <stop offset="100%" stopColor="hsl(280, 70%, 60%)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 92%)" vertical={false} />
          <XAxis dataKey="name" stroke="hsl(225, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(225, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
        </BarChart>
      );
    }
    
    if (data.type === 'line') {
      return (
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(243, 75%, 59%)" />
              <stop offset="100%" stopColor="hsl(280, 70%, 60%)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 92%)" vertical={false} />
          <XAxis dataKey="name" stroke="hsl(225, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(225, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip {...tooltipStyle} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="url(#lineGradient)" 
            strokeWidth={3}
            dot={{ fill: 'hsl(243, 75%, 59%)', strokeWidth: 0, r: 5 }}
            activeDot={{ r: 7, fill: 'hsl(280, 70%, 60%)' }}
          />
        </LineChart>
      );
    }
    
    return (
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          dataKey="value"
          paddingAngle={3}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={{ stroke: 'hsl(225, 12%, 50%)', strokeWidth: 1 }}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
      </PieChart>
    );
  };

  return (
    <div className="card-elevated p-6">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
