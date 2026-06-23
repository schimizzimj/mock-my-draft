import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../src/config/theme';
import { SentimentGradeScatter } from '../../../src/components/sentiment-grade-scatter';

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);

// Mock recharts to avoid canvas issues in jest
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

describe('SentimentGradeScatter', () => {
  it('renders fallback when no data', () => {
    renderWithTheme(<SentimentGradeScatter data={[]} />);
    expect(screen.getByText(/no sentiment data/i)).toBeInTheDocument();
  });

  it('renders heading when data present', () => {
    const data = [
      { source: 'ESPN', grade: 3.5, sentiment: 0.6 },
    ];
    renderWithTheme(<SentimentGradeScatter data={data} />);
    expect(screen.getByText(/sentiment vs grade/i)).toBeInTheDocument();
  });
});
