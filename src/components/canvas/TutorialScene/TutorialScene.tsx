import { Environment, Grid, OrbitControls } from '@react-three/drei';

import { BoneGizmo } from '@/components/canvas/BoneGizmo';
import { SkinnedArm } from '@/components/canvas/SkinnedArm';
import { SpaceAxes } from '@/components/canvas/SpaceAxes';
import { useTutorialStore } from '@/store/useTutorialStore';

/**
 * 教程主场景:灯光 + 环境 + 控制器,并按需装配手臂、骨骼 gizmo、空间坐标轴。
 * 具体显示哪些 gizmo 由各组件内部读取 store 决定,这里只做一次性装配。
 */
export function TutorialScene() {
  const chapterId = useTutorialStore((s) => s.chapterId);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Environment preset="studio" />

      {/* 手臂(SkinnedMesh)始终存在 */}
      <SkinnedArm />

      {/* 骨骼可视化 */}
      <BoneGizmo />

      {/* 空间坐标轴(Ch4 重点,其余章节也可作参考) */}
      <SpaceAxes />

      {/* 地面网格 */}
      <Grid
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#3a3a3a"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#5a5a5a"
        fadeDistance={25}
        infiniteGrid
        position={[0, 0, 0]}
      />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        target={[0, 1.5, 0]}
        minDistance={2}
        maxDistance={20}
      />

      {/* chapterId 仅用于触发场景重渲染,实际差异在子组件内部 */}
      <group visible={false} userData={{ chapterId }} />
    </>
  );
}
