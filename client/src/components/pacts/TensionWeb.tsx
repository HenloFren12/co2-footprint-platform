// components/pacts/TensionWeb.tsx
import React, { useMemo } from 'react';
import {
  computeNodePosition,
  trustToColor,
  trustToStrokeWidth,
  trustToEdgeOpacity,
} from '../../lib/tensionWebGeometry';
import styles from './TensionWeb.module.css';

export interface PactMember {
  id: string;
  name: string;
}

interface TensionWebProps {
  members: PactMember[];
  trustScores: Record<string, number>;
  currentUserId: string;
}

export default function TensionWeb({
  members,
  trustScores,
  currentUserId,
}: TensionWebProps) {
  const nodes = useMemo(
    () =>
      members.map((member, index) => {
        const trust = trustScores[member.id] ?? 100;
        const pos = computeNodePosition(index, members.length, trust);
        return {
          ...member,
          ...pos,
          trust,
          color: trustToColor(trust),
          isCurrentUser: member.id === currentUserId,
        };
      }),
    [members, trustScores, currentUserId]
  );

  const avgTrust =
    members.length > 0
      ? Math.round(
          Object.values(trustScores).reduce((sum, s) => sum + s, 0) /
            members.length
        )
      : 100;

  return (
    <svg
      viewBox="0 0 300 300"
      role="img"
      aria-label={`Pact tension web with ${members.length} members. Average trust score: ${avgTrust} out of 100.`}
      className={styles.tensionWeb}
    >
      {/* Edges */}
      {nodes.flatMap((nodeA, i) =>
        nodes.slice(i + 1).map((nodeB) => {
          const minTrust = Math.min(nodeA.trust, nodeB.trust);
          return (
            <line
              key={`${nodeA.id}-${nodeB.id}`}
              x1={nodeA.x}
              y1={nodeA.y}
              x2={nodeB.x}
              y2={nodeB.y}
              stroke={trustToColor(minTrust)}
              strokeWidth={trustToStrokeWidth(minTrust)}
              opacity={trustToEdgeOpacity(minTrust)}
              className={styles.tensionWebNode}
            />
          );
        })
      )}

      {/* Nodes */}
      {nodes.map((node) => (
        <g
          key={node.id}
          transform={`translate(${node.x}, ${node.y})`}
          className={styles.tensionWebNode}
        >
          {/* Glow ring */}
          <circle
            r={22}
            fill={node.color}
            opacity={0.2 + (node.trust / 100) * 0.3}
            className={
              node.trust >= 75 ? styles.nodeHealthyGlow : ''
            }
          />
          {/* Core node */}
          <circle
            r={16}
            fill={node.isCurrentUser ? '#4ade80' : '#475569'}
            stroke={node.color}
            strokeWidth={2}
          />
          {/* Label */}
          <text
            y={28}
            textAnchor="middle"
            fontSize={10}
            fill="#cbd5e1"
            aria-hidden="true"
          >
            {node.name.split(' ')[0]}
          </text>
        </g>
      ))}
    </svg>
  );
}