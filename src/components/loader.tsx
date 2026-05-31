"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface LoaderProps {
  className?: string;
  messages?: string[];
  text?: string;
  intervalMs?: number;
}

const DEFAULT_MESSAGES = [
  "Loading...",
  "Connecting to your account...",
  "Working on it...",
  "Almost there...",
];

export function Loader({
  className,
  messages = DEFAULT_MESSAGES,
  text,
  intervalMs = 2500,
}: LoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (text !== undefined || messages.length <= 1) return;

    const intervalId = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [messages.length, intervalMs, text]);

  const displayMessage = text !== undefined ? text : messages[messageIndex];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <svg
        className="animate-spin text-primary w-8 h-8"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {displayMessage && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          {displayMessage}
        </p>
      )}
    </div>
  );
}

