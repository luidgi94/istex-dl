import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ExamplesButton from './ExamplesButton';

describe('<ExamplesButton />', () => {
  test('it should mount', () => {
    render(<ExamplesButton />);
    
    const examplesButton = screen.getByTestId('ExamplesButton');

    expect(examplesButton).toBeInTheDocument();
  });
});