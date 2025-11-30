/**
 * Generic Button component used across STREAMIA UI.
 *
 * Small stylized wrapper around a native button element.
 */
import React from 'react';
import '../styles/Button.scss';

/**
 * Button variant types
 */
type ButtonVariant = 'primary' | 'outline' | 'secondary';

/**
 * Button size types
 */
type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Props interface for Button component
 */
interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
}

/**
 * Reusable button component
 * @param props - ButtonProps
 * @returns JSX element containing the button
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  href
}) => {
  const buttonClasses = `btn btn--${variant} btn--${size} ${className}`.trim();

  if (href) {
    return (
      <a 
        href={href}
        className={buttonClasses}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;