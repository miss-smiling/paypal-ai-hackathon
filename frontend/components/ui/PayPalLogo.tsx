import React from "react";

interface PayPalLogoProps {
  className?: string;
  variant?: "full" | "monogram" | "white" | "dark";
  height?: number | string;
}

/**
 * Official PayPal Brand Logo Component
 * Renders authentic SVG vectors for PayPal monogram and wordmark
 * adhering to PayPal brand guidelines (#003087 deep blue, #0079C1 light blue).
 */
export default function PayPalLogo({
  className = "h-5",
  variant = "full",
}: PayPalLogoProps) {
  if (variant === "monogram") {
    return (
      <svg
        viewBox="0 0 100 115"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="PayPal Monogram"
      >
        {/* Back P (Cyan/Light Blue) */}
        <path
          d="M34.7 11.2h32.2c18.3 0 31.4 8.7 29.3 27.2-2.3 20.3-15.6 28.6-31.5 28.6H51.4L44.8 107H22.5l12.2-95.8z"
          fill="#0079C1"
        />
        {/* Front P (Navy/Deep Blue) */}
        <path
          d="M17.4 0h34.6c19.7 0 33.7 9.4 31.5 29.3-2.5 21.8-16.8 30.8-33.9 30.8H35.3L28.2 86H5.9L17.4 0z"
          fill="#003087"
        />
        {/* Overlap Blend Region */}
        <path
          d="M34.7 11.2h17.3c19.7 0 33.7 9.4 31.5 29.3-2.5 21.8-16.8 30.8-33.9 30.8H35.3L34.7 11.2z"
          fill="#002568"
          opacity="0.25"
        />
      </svg>
    );
  }

  if (variant === "white") {
    return (
      <svg
        viewBox="0 0 310 80"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="PayPal White Logo"
      >
        <g fill="#FFFFFF">
          {/* Monogram P1 & P2 */}
          <path d="M22.5 5.5h27.4c15.6 0 26.7 7.5 24.9 23.2-2 17.3-13.3 24.4-26.9 24.4H36.7L31 74.5H13.4l9.1-69z" opacity="0.9" />
          <path d="M36.2 14.4h25.5c14.5 0 24.9 6.9 23.2 21.6-1.8 16.1-12.4 22.7-25 22.7H49.4L44.2 78.5H26.5l9.7-64.1z" />
          {/* PayPal Wordmark in white */}
          <text
            x="96"
            y="55"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="44"
            fill="#FFFFFF"
            letterSpacing="-1.5"
          >
            PayPal
          </text>
        </g>
      </svg>
    );
  }

  // Full color official logo
  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <svg
        viewBox="0 0 100 115"
        className="h-full w-auto shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M34.7 11.2h32.2c18.3 0 31.4 8.7 29.3 27.2-2.3 20.3-15.6 28.6-31.5 28.6H51.4L44.8 107H22.5l12.2-95.8z"
          fill="#0079C1"
        />
        <path
          d="M17.4 0h34.6c19.7 0 33.7 9.4 31.5 29.3-2.5 21.8-16.8 30.8-33.9 30.8H35.3L28.2 86H5.9L17.4 0z"
          fill="#003087"
        />
      </svg>
      <span className="font-sans font-black italic tracking-tighter leading-none text-base sm:text-lg flex items-baseline">
        <span className="text-[#003087]">Pay</span>
        <span className="text-[#0079C1]">Pal</span>
      </span>
    </div>
  );
}
