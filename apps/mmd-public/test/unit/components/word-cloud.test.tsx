import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../src/config/theme';
import { WordCloud } from '../../../src/components/word-cloud';

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);

describe('WordCloud', () => {
  it('renders fallback when keywords is empty', () => {
    renderWithTheme(<WordCloud keywords={[]} />);
    expect(screen.getByText(/no text analysis data/i)).toBeInTheDocument();
  });

  it('renders words with varying sizes', () => {
    const keywords = [
      { word: 'athletic', count: 10 },
      { word: 'raw', count: 5 },
      { word: 'upside', count: 1 },
    ];
    renderWithTheme(<WordCloud keywords={keywords} />);
    expect(screen.getByText('athletic')).toBeInTheDocument();
    expect(screen.getByText('raw')).toBeInTheDocument();
    expect(screen.getByText('upside')).toBeInTheDocument();
  });
});
