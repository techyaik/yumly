import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

interface SpatulaIconProps {
  size?: number;
  color?: string;
}

export default function SpatulaIcon({ size = 22, color = "#FF6B35" }: SpatulaIconProps) {
  const h = size * 1.6;
  return (
    <Svg width={size} height={h} viewBox="0 0 34 54">
      <Path
        d="M17 4 C8 4 2 8 2 18 C2 28 8 32 17 32 C26 32 32 28 32 18 C32 8 26 4 17 4Z"
        fill={color}
      />
      <Rect x="14" y="10" width="6" height="18" rx="1" fill="#FFF" />
      <Rect x="15.5" y="32" width="3" height="22" rx="1.5" fill={color} />
    </Svg>
  );
}
