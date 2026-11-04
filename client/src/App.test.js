import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./Socket', () => ({
  __esModule: true,
  default: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
}));

test('renders the login page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /chat one/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
