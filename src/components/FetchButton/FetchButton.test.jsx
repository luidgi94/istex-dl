import React from 'react';
import { describe, expect, it } from 'vitest';
import { customRender as render, screen } from '../../test/utils';
import FetchButton from './FetchButton';

describe('Tests for the FetchButton component', () => {
  it('Renders the fetch button', () => {
    render(<FetchButton />);
    const buttonElement = screen.getByRole('button');

    expect(buttonElement).toBeInTheDocument();
  });
});
