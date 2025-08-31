import React from 'react';
import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import HelloWorld from './HelloWorld';

test('renders HelloWorld component', () => {
  render(<HelloWorld />);
  expect(screen.getByText(/hello, world/i)).toBeInTheDocument();
});