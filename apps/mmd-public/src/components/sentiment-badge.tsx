import { Badge, Tooltip } from '@chakra-ui/react';

interface SentimentBadgeProps {
  sentiment: number | null | undefined;
}

function getSentimentLabel(compound: number): string {
  if (compound > 0.2) return 'Positive';
  if (compound < -0.2) return 'Negative';
  return 'Neutral';
}

function getSentimentColor(compound: number): string {
  if (compound > 0.2) return 'green';
  if (compound < -0.2) return 'red';
  return 'gray';
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment }) => {
  if (sentiment == null) return null;

  const label = getSentimentLabel(sentiment);
  const colorScheme = getSentimentColor(sentiment);

  return (
    <Tooltip label={`Sentiment: ${sentiment.toFixed(2)}`} placement="top">
      <Badge colorScheme={colorScheme} variant="subtle" fontSize="xs" ml={2}>
        {label}
      </Badge>
    </Tooltip>
  );
};
