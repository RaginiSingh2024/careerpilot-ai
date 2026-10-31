import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { CareerProvider } from './context/CareerContext';

describe('CareerPilot AI Frontend App', () => {
  it('renders application brand and navigation links properly', () => {
    render(
      <BrowserRouter>
        <CareerProvider>
          <App />
        </CareerProvider>
      </BrowserRouter>
    );

    // Verify brand heading exists
    const brandElements = screen.getAllByText(/CareerPilot/i);
    expect(brandElements.length).toBeGreaterThan(0);

    // Verify core navigation links exist
    expect(screen.getByText('Career Profile')).toBeDefined();
    expect(screen.getByText('Skill Gap Analysis')).toBeDefined();
    expect(screen.getByText('Learning Roadmap')).toBeDefined();
  });
});

