'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 1.2,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}: Props) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) =>
    `${prefix}${v.toLocaleString('ko-KR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`
  );
  const prevRef = useRef(0);

  useEffect(() => {
    const ctrl = animate(motionVal, value, {
      duration,
      ease: 'easeOut',
      from: prevRef.current,
    });
    prevRef.current = value;
    return ctrl.stop;
  }, [value, duration, motionVal]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
