import { useEffect, useState } from 'react';

import * as THREE from 'three';

import { useTutorialStore } from '@/store/useTutorialStore';
import { getArmRig, getSkinnedVertexWorld } from '@/utils/skinning';

/** 一个顶点在各空间下的坐标快照。 */
interface SpaceSnapshot {
  local: THREE.Vector3; // mesh / model 空间下的绑定姿态原始坐标
  world: THREE.Vector3; // 蒙皮变形后的世界坐标
  vertexCount: number;
}

const _v = new THREE.Vector3();

function readSnapshot(vertexId: number): SpaceSnapshot | null {
  const rig = getArmRig();
  const posAttr = rig.geometry.attributes.position;
  if (!posAttr) return null;
  const count = posAttr.count;
  const id = Math.min(Math.max(0, vertexId), count - 1);

  const local = new THREE.Vector3().fromBufferAttribute(posAttr as THREE.BufferAttribute, id);
  const world = getSkinnedVertexWorld(id) ?? _v.clone();
  return { local, world, vertexCount: count };
}

function fmt(v: THREE.Vector3): string {
  return `${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}`;
}

interface RowProps {
  label: string;
  value: string;
  hint: string;
  color: string;
}

function Row({ label, value, hint, color }: RowProps) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-white/5 py-1 last:border-0">
      <div>
        <div className="text-xs font-medium" style={{ color }}>
          {label}
        </div>
        <div className="text-[10px] text-white/40">{hint}</div>
      </div>
      <code className="font-mono text-[11px] text-white/80">{value}</code>
    </div>
  );
}

/**
 * 实时矩阵 / 坐标面板:用低频(~8fps)轮询读取 live 状态显示数值,
 * 绝不在 useFrame 里 setState。
 */
export function MatrixInspector() {
  const probeVertexId = useTutorialStore((s) => s.probeVertexId);
  const [snap, setSnap] = useState<SpaceSnapshot | null>(null);

  useEffect(() => {
    const tick = () => setSnap(readSnapshot(probeVertexId));
    tick();
    const interval = setInterval(tick, 120);
    return () => clearInterval(interval);
  }, [probeVertexId]);

  if (!snap) return null;

  return (
    <div className="rounded-md border border-white/10 bg-black/40 p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/50">
        顶点 #{Math.min(probeVertexId, snap.vertexCount - 1)} 的坐标
      </div>
      <Row label="local / mesh" value={fmt(snap.local)} hint="绑定姿态下的原始坐标(不随骨骼变)" color="#a78bfa" />
      <Row label="world" value={fmt(snap.world)} hint="经 LBS 蒙皮 + mesh 变换后的世界坐标" color="#38bdf8" />
    </div>
  );
}
