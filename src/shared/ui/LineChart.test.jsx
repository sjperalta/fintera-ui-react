import { render, screen, cleanup } from '@testing-library/react';
import LineChart from './LineChart';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React, { useState, useEffect } from 'react';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock react-chartjs-2
vi.mock('react-chartjs-2', async () => {
  const actual = await vi.importActual('react-chartjs-2');
  return {
    ...actual,
    Line: vi.fn(({ options, data }) => (
      <div data-testid="chart-mock">
        <span data-testid="options-json">{JSON.stringify(options)}</span>
        <span data-testid="data-json">{JSON.stringify(data)}</span>
      </div>
    )),
  };
});

describe('LineChart', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Functionality', () => {
    it('uses default options and data when no props provided', async () => {
      render(<LineChart />);

      const optionsEl = screen.getByTestId('options-json');
      const options = JSON.parse(optionsEl.textContent);

      expect(options.responsive).toBe(true);

      const dataEl = screen.getByTestId('data-json');
      const data = JSON.parse(dataEl.textContent);

      expect(data.datasets[0].label).toBe("Visitor");
    });

    it('uses provided options and data', async () => {
      const customOptions = { custom: true, responsive: false };
      const customData = { labels: ['A'], datasets: [{ data: [1] }] };

      render(<LineChart option={customOptions} dataSet={customData} />);

      const optionsEl = screen.getByTestId('options-json');
      const options = JSON.parse(optionsEl.textContent);

      expect(options.custom).toBe(true);

      const dataEl = screen.getByTestId('data-json');
      const data = JSON.parse(dataEl.textContent);

      expect(data.labels[0]).toBe("A");
    });
  });

  describe('Performance / Optimization', () => {
    it('passes stable props to Line component on re-renders', async () => {
      const { Line } = await import('react-chartjs-2');

      function ParentComponent({ renderCount = 5 }) {
        const [count, setCount] = useState(0);
        useEffect(() => {
          if (count < renderCount) {
            const timer = setTimeout(() => setCount((c) => c + 1), 0);
            return () => clearTimeout(timer);
          }
        }, [count, renderCount]);
        return <LineChart />;
      }

      render(<ParentComponent renderCount={5} />);

      // Wait for renders
      await new Promise(r => setTimeout(r, 200));

      const calls = Line.mock.calls;
      expect(calls.length).toBeGreaterThan(1);

      let differentOptionsCount = 0;
      let differentDataCount = 0;

      for (let i = 1; i < calls.length; i++) {
        const prevProps = calls[i-1][0];
        const currentProps = calls[i][0];

        if (prevProps.options !== currentProps.options) differentOptionsCount++;
        if (prevProps.data !== currentProps.data) differentDataCount++;
      }

      expect(differentOptionsCount).toBe(0);
      expect(differentDataCount).toBe(0);
    });
  });
});
