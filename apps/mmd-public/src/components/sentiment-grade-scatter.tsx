import { Box, Heading, Text } from '@chakra-ui/react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface DataPoint {
  source: string;
  grade: number;
  sentiment: number;
}

interface SentimentGradeScatterProps {
  data: DataPoint[];
}

const SOURCE_COLORS = ['#4a90e2', '#e2844a', '#50c878', '#e24a6e', '#9b59b6', '#f1c40f', '#1abc9c'];

export const SentimentGradeScatter: React.FC<SentimentGradeScatterProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box>
        <Heading size="md" mb={4}>Sentiment vs Grade</Heading>
        <Text color="gray.500">No sentiment data available</Text>
      </Box>
    );
  }

  const sourceGroups = new Map<string, DataPoint[]>();
  for (const point of data) {
    if (!sourceGroups.has(point.source)) {
      sourceGroups.set(point.source, []);
    }
    sourceGroups.get(point.source)!.push(point);
  }

  const sources = Array.from(sourceGroups.keys());

  return (
    <Box>
      <Heading size="md" mb={4}>Sentiment vs Grade</Heading>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <XAxis
            type="number"
            dataKey="grade"
            name="Grade"
            domain={[0, 4.3]}
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
            label={{ value: 'Grade', position: 'bottom', fill: '#A0AEC0' }}
          />
          <YAxis
            type="number"
            dataKey="sentiment"
            name="Sentiment"
            domain={[-1, 1]}
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
            label={{ value: 'Sentiment', angle: -90, position: 'insideLeft', fill: '#A0AEC0' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as DataPoint;
              return (
                <Box bg="elevations.dark.dp08" p={3} rounded="lg">
                  <Text fontWeight="bold">{point.source}</Text>
                  <Text>Grade: {point.grade.toFixed(1)}</Text>
                  <Text>Sentiment: {point.sentiment.toFixed(2)}</Text>
                </Box>
              );
            }}
          />
          <ReferenceLine y={0} stroke="#718096" strokeDasharray="3 3" />
          {sources.map((source, i) => (
            <Scatter
              key={source}
              name={source}
              data={sourceGroups.get(source)}
              fill={SOURCE_COLORS[i % SOURCE_COLORS.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};
