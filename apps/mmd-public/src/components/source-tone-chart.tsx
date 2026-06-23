import { Box, Heading, Text } from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

interface SourceToneChartProps {
  data: Array<{ source: string; sentiment: number }>;
  title?: string;
}

function getSentimentBarColor(sentiment: number): string {
  if (sentiment > 0.2) return '#38A169';
  if (sentiment < -0.2) return '#E53E3E';
  return '#A0AEC0';
}

export const SourceToneChart: React.FC<SourceToneChartProps> = ({
  data,
  title = 'Source Tone Comparison',
}) => {
  if (!data || data.length === 0) {
    return (
      <Box>
        <Heading size="md" mb={4}>{title}</Heading>
        <Text color="gray.500">No sentiment data available</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>{title}</Heading>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 50)}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <XAxis
            type="number"
            domain={[-1, 1]}
            tickCount={5}
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="source"
            width={120}
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload as { source: string; sentiment: number };
              return (
                <Box bg="elevations.dark.dp08" p={3} rounded="lg">
                  <Text fontWeight="bold">{item.source}</Text>
                  <Text>Sentiment: {item.sentiment.toFixed(2)}</Text>
                </Box>
              );
            }}
          />
          <ReferenceLine x={0} stroke="#718096" strokeDasharray="3 3" />
          <Bar dataKey="sentiment" maxBarSize={30}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getSentimentBarColor(entry.sentiment)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
