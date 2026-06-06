import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useTutorialStore } from '@/store/useTutorialStore';
import { BONE_COLORS, BONE_COUNT, getArmRig } from '@/utils/skinning';

import type { Group, LineSegments, Mesh } from 'three';

const JOINT_RADIUS = 0.08;
const AXIS_LENGTH = 0.5;

// 复用的临时对象,避免每帧分配。
const tmpVec = new THREE.Vector3();
const tmpVecChild = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpScale = new THREE.Vector3();

// 骨骼连线几何:与单例 rig 一一对应,模块级持有一份即可。
const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(new Array(BONE_COUNT * 6).fill(0), 3),
);

/**
 * 骨骼可视化:每根关节一个球、父子之间一条连线、每根骨骼一组 local 坐标轴。
 * 全部每帧从骨骼的 world matrix 读取位置/朝向(mutate,不 setState)。
 */
export function BoneGizmo() {
  const rig = getArmRig();
  const showBones = useTutorialStore((s) => s.showBones);
  const showBoneAxes = useTutorialStore((s) => s.showBoneAxes);

  const groupRef = useRef<Group>(null);
  const jointRefs = useRef<(Mesh | null)[]>([]);
  const lineRef = useRef<LineSegments | null>(null);
  const axesGroupRef = useRef<Group>(null);

  useFrame(() => {
    if (!showBones) return;
    const bones = rig.bones;

    // 关节球:取每根骨骼 world 位置。
    for (let i = 0; i < bones.length; i++) {
      const m = jointRefs.current[i];
      if (!m) continue;
      bones[i]!.getWorldPosition(tmpVec);
      m.position.copy(tmpVec);
    }

    // 连线:每根骨骼从自身 world 位置连到第一个子骨骼(末端骨骼朝 +Y 外推)。
    const posAttr = lineGeometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < bones.length; i++) {
      bones[i]!.getWorldPosition(tmpVec);
      const child = bones[i + 1];
      if (child) {
        child.getWorldPosition(tmpVecChild);
      } else {
        // 末端:沿骨骼 local +Y 方向外推一段,表示手腕朝向。
        bones[i]!.getWorldQuaternion(tmpQuat);
        tmpVecChild.set(0, 1, 0).applyQuaternion(tmpQuat);
        tmpVecChild.multiplyScalar(0.6).add(tmpVec);
      }
      posAttr.setXYZ(i * 2, tmpVec.x, tmpVec.y, tmpVec.z);
      posAttr.setXYZ(i * 2 + 1, tmpVecChild.x, tmpVecChild.y, tmpVecChild.z);
    }
    posAttr.needsUpdate = true;

    // local 坐标轴:让每个 AxesHelper 对齐对应骨骼的 world 矩阵。
    if (axesGroupRef.current) {
      axesGroupRef.current.children.forEach((axis, i) => {
        const bone = bones[i];
        if (!bone) return;
        bone.matrixWorld.decompose(axis.position, axis.quaternion, tmpScale);
        axis.scale.setScalar(1);
      });
    }
  });

  if (!showBones) return null;

  return (
    <group ref={groupRef} renderOrder={999}>
      {/* 关节球 */}
      {rig.bones.map((_, i) => (
        <mesh key={i} ref={(el) => (jointRefs.current[i] = el)} renderOrder={999}>
          <sphereGeometry args={[JOINT_RADIUS, 16, 16]} />
          <meshBasicMaterial color={BONE_COLORS[i]} depthTest={false} transparent />
        </mesh>
      ))}

      {/* 骨骼连线 */}
      <lineSegments ref={lineRef} geometry={lineGeometry} renderOrder={999}>
        <lineBasicMaterial color="#ffffff" depthTest={false} transparent linewidth={2} />
      </lineSegments>

      {/* 每根骨骼的 local 坐标轴 */}
      {showBoneAxes && (
        <group ref={axesGroupRef}>
          {rig.bones.map((_, i) => (
            <axesHelper key={i} args={[AXIS_LENGTH]} />
          ))}
        </group>
      )}
    </group>
  );
}
