// __tests__/LoginPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/(auth)/signin/page';
import { signIn } from 'next-auth/react';
import * as nextNavigation from "next/navigation";

// 🧪 Mock next-auth signIn
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// 🧪 Mock useRouter
jest.mock("next/navigation", () => {
  return {
    __esModule: true,
    useRouter: jest.fn(),
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const pushMock = jest.fn();
    (nextNavigation.useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  test('renders login form correctly', () => {
    render(<LoginPage />);

    expect(screen.getByText('Sign in to our platform')).toBeInTheDocument();
    expect(screen.getByLabelText('Your email')).toBeInTheDocument();
    expect(screen.getByLabelText('Your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login to your account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login to your account Google' })).toBeInTheDocument();
    expect(screen.getByText(/Not registered\?/i)).toBeInTheDocument();
  });

  test('updates input values when typing', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Your email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Your password') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('calls signIn with credentials on login button click', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({});

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Your password'), { target: { value: 'password123' } });

    const loginButton = screen.getByRole('button', { name: 'Login to your account' });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('shows error alert when login fails', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({
      error: 'Invalid credentials',
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Your email'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText('Your password'), { target: { value: 'wrongpass' } });

    const loginButton = screen.getByRole('button', { name: 'Login to your account' });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('shows error alert when login using Google fails', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({ error: 'Google login failed' });

    render(<LoginPage />);

    const googleButton = screen.getByRole('button', { name: 'Login to your account Google' });

    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('Google login failed')).toBeInTheDocument();
    });
  });

  test('calls signIn with google provider on google login button click', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({});

    render(<LoginPage />);

    const googleButton = screen.getByRole('button', { name: 'Login to your account Google' });

    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('google', {
        callbackUrl: '/dashboard',
      });
    });
  });

  test("calls signIn with credentials and redirects on success", async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({});

    const pushMock = jest.fn();
    (nextNavigation.useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Your email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Your password"), { target: { value: "testpass" } });

    const loginButton = screen.getByRole("button", { name: "Login to your account" });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: "test@example.com",
        password: "testpass",
      });

      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });
});
