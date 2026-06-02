"use client";

import { formatTime } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Timer({
  durationSeconds,
  running,
}: {
  durationSeconds: number;
  running: boolean;
}) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  return <span className="font-mono text-sm font-semibold text-gold-600">{formatTime(remaining)}</span>;
}
