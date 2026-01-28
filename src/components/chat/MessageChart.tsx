import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface MessageChartProps {
  data: {
    labels: string[];
    values: number[];
    type: 'bar' | 'line' | 'pie';
  };
}

const CHART_COLORS = [
  'hsl(220, 90%, 56%)',
  'hsl(220, 70%, 70%)',
  'hsl(260, 60%, 60%)',
  'hsl(200, 60%, 55%)',
  'hsl(220, 50%, 50%)',
];

export const MessageChart = ({ data }: MessageChartProps) => {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
  }));

  const tooltipStyle = {
    contentStyle: { 
      backgroundColor: 'hsl(0, 0%, 100%)',
      border: '1px solid hsl(220, 10%, 92%)',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
      padding: '10px 14px',
      fontSize: '13px',
    },
  };

  const renderChart = () => {
    if (data.type === 'bar') {
      return (
        <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 92%)" vertical={false} />
          <XAxis dataKey="name" stroke="hsl(220, 10%, 45%)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(220, 10%, 45%)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="value" fill="hsl(220, 90%, 56%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }
    
    if (data.type === 'line') {
      return (
        <LineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 92%)" vertical={false} />
          <XAxis dataKey="name" stroke="hsl(220, 10%, 45%)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(220, 10%, 45%)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip {...tooltipStyle} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="hsl(220, 90%, 56%)" 
            strokeWidth={2}
            dot={{ fill: 'hsl(220, 90%, 56%)', strokeWidth: 0, r: 4 }}
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
          innerRadius={45}
          outerRadius={80}
          dataKey="value"
          paddingAngle={2}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: 'hsl(220, 10%, 45%)', strokeWidth: 1 }}
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
    <div className="rounded-xl border border-border p-4 bg-card">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
