import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Box } from '@chakra-ui/react';

interface SparklineProps {
  data: Array<{ year: number; grade: number }>;
  color?: string;
  sentimentData?: Array<{ year: number; sentiment: number }>;
}

function getSentimentDotColor(sentiment: number): string {
  if (sentiment > 0.2) return '#38A169';
  if (sentiment < -0.2) return '#E53E3E';
  return '#A0AEC0';
}

export const Sparkline = React.memo<SparklineProps>(({ data, color = '#4a90e2', sentimentData }) => {
  const mergedData = sentimentData
    ? data.map((d) => {
        const match = sentimentData.find((s) => s.year === d.year);
        return { ...d, sentiment: match?.sentiment ?? null };
      })
    : data;

  const renderDot = sentimentData
    ? (props: { cx?: number; cy?: number; payload?: { sentiment?: number | null } }) => {
        const { cx, cy, payload } = props;
        if (cx == null || cy == null || payload?.sentiment == null) return <></>;
        return (
          <circle
            cx={cx}
            cy={cy}
            r={3}
            fill={getSentimentDotColor(payload.sentiment)}
            stroke="none"
          />
        );
      }
    : false;

  return (
    <Box display="inline-block" width="60px" height="24px" verticalAlign="middle">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mergedData}>
          <Line
            type="monotone"
            dataKey="grade"
            stroke={color}
            strokeWidth={2}
            dot={renderDot}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
});

Sparkline.displayName = 'Sparkline';
