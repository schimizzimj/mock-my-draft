import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../src/config/theme';
import { SourceToneChart } from '../../../src/components/source-tone-chart';

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

describe('SourceToneChart', () => {
  it('renders fallback when no data', () => {
    renderWithTheme(<SourceToneChart data={[]} />);
    expect(screen.getByText(/no sentiment data/i)).toBeInTheDocument();
  });

  it('renders chart heading with data', () => {
    const data = [
      { source: 'ESPN', sentiment: 0.65 },
      { source: 'CBS Sports', sentiment: -0.2 },
    ];
    renderWithTheme(<SourceToneChart data={data} />);
    expect(screen.getByText(/source tone/i)).toBeInTheDocument();
  });
});
