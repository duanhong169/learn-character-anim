import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';

import { useTutorialStore } from '@/store/useTutorialStore';
import { getSkinnedVertexWorld } from '@/utils/skinning';

import type { Group, Mesh } from 'three';

/**
 * Ch4 空间可视化:
 * - World 原点坐标轴(固定在场景原点)。
 * - Mesh(model)原点坐标轴:跟随整体平移 meshOffset。
 * - 被检视顶点的标记球:显示在它经蒙皮后的 world 位置。
 *
 * Bone 的 local 坐标轴由 BoneGizmo 负责绘制(showBoneAxes)。
 */
export function SpaceAxes() {
  const showWorldAxes = useTutorialStore((s) => s.showWorldAxes);

  const meshAxesRef = useRef<Group>(null);
  const probeRef = useRef<Mesh>(null);

  useFrame(() => {
    const { meshOffset, probeVertexId } = useTutorialStore.getState();

    // Mesh 原点轴:跟随 mesh 整体平移。
    if (meshAxesRef.current) {
      meshAxesRef.current.position.set(meshOffset[0], meshOffset[1], meshOffset[2]);
    }

    // 探针顶点:取其蒙皮后的 world 位置。
    if (probeRef.current) {
      const world = getSkinnedVertexWorld(probeVertexId);
      if (world) probeRef.current.position.copy(world);
    }
  });

  return (
    <>
      {showWorldAxes && <axesHelper args={[1.2]} />}

      {/* Mesh / model 原点坐标轴(略小,区别于 world) */}
      <group ref={meshAxesRef}>
        <axesHelper args={[0.8]} />
      </group>

      {/* 探针顶点标记 */}
      <mesh ref={probeRef} renderOrder={1000}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ffffff" depthTest={false} transparent />
      </mesh>
    </>
  );
}
