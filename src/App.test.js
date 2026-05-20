import { render, screen } from '@testing-library/react';
import App from './App';

test('renders difficulty selection screen', () => {
  render(<App />);
  const titleElement = screen.getByText(/ВЫБЕРИТЕ СЛОЖНОСТЬ/i);
  expect(titleElement).toBeInTheDocument();
});
