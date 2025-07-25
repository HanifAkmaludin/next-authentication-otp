import { render, screen } from '@testing-library/react';
import BaseAlert from '@/components/base-alert';

describe('BaseAlert Component', () => {
  test('renders alert with error message and type', () => {
    const alert = {
      type: "error",
      message: "This is an error",
      isShow: true
    };

    render(<BaseAlert alert={alert} />);

    expect(screen.getByText("This is an error")).toBeInTheDocument();
  });

  test('renders alert with correct message and type', () => {
    const alert = {
      type: "success",
      message: "This is a success",
      isShow: true
    };

    render(<BaseAlert alert={alert} />);

    expect(screen.getByText("This is a success")).toBeInTheDocument();
  });

  test('renders alert with warning message and type', () => {
    const alert = {
      type: "warning",
      message: "This is a warning",
      isShow: true
    };

    render(<BaseAlert alert={alert} />);

    expect(screen.getByText("This is a warning")).toBeInTheDocument();
  });

  test('renders alert with info message and type', () => {
    const alert = {
      type: "info",
      message: "This is an info",
      isShow: true
    };

    render(<BaseAlert alert={alert} />);

    expect(screen.getByText("This is an info")).toBeInTheDocument();
  });

  test('renders alert with random message and type', () => {
    const alert = {
      type: "random",
      message: "This is a random",
      isShow: true
    };

    render(<BaseAlert alert={alert} />);

    expect(screen.getByText("This is a random")).toBeInTheDocument();
  });
});
