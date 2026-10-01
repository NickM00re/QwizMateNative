// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

import React from "react";
import { View, LayoutChangeEvent } from "react-native";
import Svg, { Polyline, Circle, Line as SvgLine, Text as SvgText } from "react-native-svg";
import { fonts } from "../theme/fonts";
import { colors } from "../theme/colors";

interface Point {
  wk: string;
  score: number;
}

// A small hand-rolled line chart replacing recharts <LineChart>, styled to
// match the original: indigo line + dots, faint axis labels, 40-100 domain.
export default function TrendLineChart({
  data,
  height = 130,
}: {
  data: Point[];
  height?: number;
}) {
  const [width, setWidth] = React.useState(0);
  const padding = { top: 10, right: 10, bottom: 22, left: 10 };
  const domain: [number, number] = [40, 100];

  const innerW = Math.max(width - padding.left - padding.right, 1);
  const innerH = Math.max(height - padding.top - padding.bottom, 1);

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerW;
    const t = (d.score - domain[0]) / (domain[1] - domain[0]);
    const y = padding.top + (1 - t) * innerH;
    return { x, y, ...d };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View
      style={{ width: "100%", height }}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          {points.length > 1 && (
            <Polyline
              points={polylinePoints}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill={colors.primary}
            />
          ))}
          {points.map((p, i) => (
            <SvgText
              key={`label-${i}`}
              x={p.x}
              y={height - 6}
              fontSize={10}
              fill={colors.mutedForeground}
              textAnchor="middle"
            >
              {p.wk}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}
