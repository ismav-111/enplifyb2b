import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface MessageChartProps {
  data: {
    labels: string[];
    values: number[];
    type: 'bar' | 'line' | 'pie';
  };
}

const CHART_COLORS = [
  'hsl(238, 43%, 56%)',
  'hsl(238, 43%, 70%)',
  'hsl(238, 43%, 45%)',
  'hsl(220, 14%, 60%)',
  'hsl(238, 30%, 65%)',
];

export const MessageChart = ({ data }: MessageChartProps) => {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
  }));

  const renderChart = () => {
    if (data.type === 'bar') {
      return (
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
          <XAxis dataKey="name" stroke="hsl(220, 10%, 46%)" fontSize={12} />
          <YAxis stroke="hsl(220, 10%, 46%)" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(220, 13%, 91%)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Bar dataKey="value" fill="hsl(238, 43%, 56%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }
    
    if (data.type === 'line') {
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
          <XAxis dataKey="name" stroke="hsl(220, 10%, 46%)" fontSize={12} />
          <YAxis stroke="hsl(220, 10%, 46%)" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(220, 13%, 91%)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="hsl(238, 43%, 56%)" 
            strokeWidth={2}
            dot={{ fill: 'hsl(238, 43%, 56%)', strokeWidth: 0 }}
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
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(0, 0%, 100%)',
            border: '1px solid hsl(220, 13%, 91%)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
      </PieChart>
    );
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
