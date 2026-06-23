import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../src/config/theme';
import { SentimentBadge } from '../../../src/components/sentiment-badge';

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);

describe('SentimentBadge', () => {
  it('renders nothing when sentiment is null', () => {
    renderWithTheme(<SentimentBadge sentiment={null} />);
    expect(screen.queryByText('Positive')).not.toBeInTheDocument();
    expect(screen.queryByText('Neutral')).not.toBeInTheDocument();
    expect(screen.queryByText('Negative')).not.toBeInTheDocument();
  });

  it('shows positive badge for compound > 0.2', () => {
    renderWithTheme(<SentimentBadge sentiment={0.75} />);
    expect(screen.getByText('Positive')).toBeInTheDocument();
  });

  it('shows neutral badge for compound between -0.2 and 0.2', () => {
    renderWithTheme(<SentimentBadge sentiment={0.1} />);
    expect(screen.getByText('Neutral')).toBeInTheDocument();
  });

  it('shows negative badge for compound < -0.2', () => {
    renderWithTheme(<SentimentBadge sentiment={-0.5} />);
    expect(screen.getByText('Negative')).toBeInTheDocument();
  });
});
