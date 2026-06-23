import { Box, Flex, Text, Heading } from '@chakra-ui/react';

interface WordCloudProps {
  keywords: Array<{ word: string; count: number }>;
  color?: string;
}

export const WordCloud: React.FC<WordCloudProps> = ({ keywords, color = '#4a90e2' }) => {
  if (!keywords || keywords.length === 0) {
    return (
      <Box>
        <Heading size="md" mb={4}>Key Terms</Heading>
        <Text color="gray.500">No text analysis data available</Text>
      </Box>
    );
  }

  const maxCount = Math.max(...keywords.map((k) => k.count));
  const minSize = 0.75;
  const maxSize = 2.0;

  return (
    <Box>
      <Heading size="md" mb={4}>Key Terms</Heading>
      <Flex flexWrap="wrap" gap={2} justifyContent="center" p={4}>
        {keywords.map((kw) => {
          const scale = maxCount > 0 ? kw.count / maxCount : 0;
          const fontSize = minSize + scale * (maxSize - minSize);

          return (
            <Text
              key={kw.word}
              fontSize={`${fontSize}rem`}
              fontWeight={scale > 0.5 ? 'bold' : 'normal'}
              color={color}
              opacity={0.5 + scale * 0.5}
              px={1}
              title={`${kw.word}: ${kw.count}`}
            >
              {kw.word}
            </Text>
          );
        })}
      </Flex>
    </Box>
  );
};
