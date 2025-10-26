import { render, screen } from "@testing-library/react";
import { Logo } from "../Logo";

describe("Logo", () => {
  it("renderiza el logo completo por defecto", () => {
    render(<Logo />);
    const logo = screen.getByLabelText(/SukaDex logo/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/full-logo.svg");
  });

  it("renderiza el logo pequeño con variant='mark'", () => {
    render(<Logo variant="mark" />);
    const logo = screen.getByLabelText(/SukaDex mark/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/small-logo.svg");
  });

  it("aplica className personalizada", () => {
    render(<Logo className="custom-class" />);
    const logo = screen.getByLabelText(/SukaDex logo/i);
    expect(logo).toHaveClass("custom-class");
  });

  it("renderiza con fondo cuando withBackground=true", () => {
    render(<Logo withBackground />);
    const logoContainer = screen.getByLabelText(/SukaDex logo/i).parentElement;
    expect(logoContainer).toHaveClass("bg-[color:var(--logo-bg)]");
  });

  it("renderiza fondo circular para variant='mark' con withBackground", () => {
    render(<Logo variant="mark" withBackground />);
    const logoContainer = screen.getByLabelText(/SukaDex mark/i).parentElement;
    expect(logoContainer).toHaveClass("rounded-full");
  });

  it("renderiza fondo rectangular para variant='full' con withBackground", () => {
    render(<Logo variant="full" withBackground />);
    const logoContainer = screen.getByLabelText(/SukaDex logo/i).parentElement;
    expect(logoContainer).toHaveClass("rounded-lg");
  });
});