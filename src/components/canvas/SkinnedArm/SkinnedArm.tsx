import { useEffect, useRef } from 'react';

import { useFrame } from '@react-three/fiber';

import { useTutorialStore } from '@/store/useTutorialStore';
import {
  ARM_LENGTH,
  assignSkinWeights,
  buildWeightColors,
  getArmRig,
} from '@/utils/skinning';
import { degToRad } from '@/utils/math';

import type { Group } from 'three';

/**
 * 手搓的 SkinnedMesh 手臂(教程核心 3D 对象)。
 *
 * - 使用模块级单例 rig(几何/材质/骨骼/Skeleton/mesh),UI 面板也读同一份。
 * - 每帧读取 store 中的关节角度,直接 mutate 骨骼 rotation(不 setState)。
 * - blendWidth / 权重热力图 / 重绑定 等变化通过 useEffect 响应。
 */
export function SkinnedArm() {
  const groupRef = useRef<Group>(null);

  // 每帧读取角度与平移并 mutate(rig 是稳定单例,在回调内取用,不进依赖数组)。
  useFrame(() => {
    const rig = getArmRig();
    const { shoulderDeg, elbowDeg, wristDeg, meshOffset } = useTutorialStore.getState();
    rig.bones[0]!.rotation.z = degToRad(shoulderDeg);
    rig.bones[1]!.rotation.z = degToRad(elbowDeg);
    rig.bones[2]!.rotation.z = degToRad(wristDeg);
    if (groupRef.current) {
      groupRef.current.position.set(meshOffset[0], meshOffset[1], meshOffset[2]);
    }
  });

  // ── blendWidth 改变:重算 skinWeight 顶点属性 ──
  const blendWidth = useTutorialStore((s) => s.blendWidth);
  useEffect(() => {
    assignSkinWeights(getArmRig().geometry, blendWidth);
  }, [blendWidth]);

  // ── 权重热力图:切换 vertexColors + 顶点色 ──
  const showWeights = useTutorialStore((s) => s.showWeights);
  const soloBone = useTutorialStore((s) => s.soloBone);
  useEffect(() => {
    const { geometry, material } = getArmRig();
    if (showWeights) {
      geometry.setAttribute('color', buildWeightColors(geometry, blendWidth, soloBone));
      material.vertexColors = true;
    } else {
      material.vertexColors = false;
    }
    material.needsUpdate = true;
  }, [showWeights, soloBone, blendWidth]);

  // ── 线框模式 ──
  const wireframe = useTutorialStore((s) => s.wireframe);
  useEffect(() => {
    getArmRig().material.wireframe = wireframe;
  }, [wireframe]);

  // ── 皮肤可见性 ──
  const showSkin = useTutorialStore((s) => s.showSkin);
  useEffect(() => {
    getArmRig().mesh.visible = showSkin;
  }, [showSkin]);

  // ── Ch2:重绑定。bindMode='rest' → 先归零姿态再 bind;'posed' → 在当前弯曲姿态 bind ──
  const bindMode = useTutorialStore((s) => s.bindMode);
  const rebindNonce = useTutorialStore((s) => s.rebindNonce);
  useEffect(() => {
    const { mesh, skeleton, bones } = getArmRig();
    if (bindMode === 'rest') {
      // 临时把骨骼归零,以 rest pose 重新绑定。
      const saved = bones.map((b) => b.rotation.z);
      bones.forEach((b) => (b.rotation.z = 0));
      mesh.updateMatrixWorld(true);
      skeleton.calculateInverses();
      mesh.bind(skeleton, mesh.matrixWorld);
      bones.forEach((b, i) => (b.rotation.z = saved[i]!));
    } else {
      // 在当前姿态绑定:inverse bind matrix 记录的是弯曲后的姿态。
      mesh.updateMatrixWorld(true);
      skeleton.calculateInverses();
      mesh.bind(skeleton, mesh.matrixWorld);
    }
  }, [bindMode, rebindNonce]);

  // ── 卸载时不 dispose:单例 rig 在重新挂载后仍会复用 ──

  return (
    <group ref={groupRef}>
      <primitive object={getArmRig().mesh} />
    </group>
  );
}

export { ARM_LENGTH };
