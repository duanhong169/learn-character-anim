import { useTutorialStore } from '@/store/useTutorialStore';
import { getArmRig } from '@/utils/skinning';

import { MatrixInspector } from '../MatrixInspector';
import { PoseControls } from './SharedControls';
import { Slider, Toggle } from '../controls';
import { Callout, Code, ControlGroup, P, SectionTitle, Term } from '../prose';

/** 第 4 章:各种空间转换。 */
export function Chapter4() {
  const meshOffset = useTutorialStore((s) => s.meshOffset);
  const probeVertexId = useTutorialStore((s) => s.probeVertexId);
  const showWorldAxes = useTutorialStore((s) => s.showWorldAxes);
  const showBoneAxes = useTutorialStore((s) => s.showBoneAxes);
  const setMeshOffset = useTutorialStore((s) => s.setMeshOffset);
  const setProbeVertexId = useTutorialStore((s) => s.setProbeVertexId);
  const setShowWorldAxes = useTutorialStore((s) => s.setShowWorldAxes);
  const setShowBoneAxes = useTutorialStore((s) => s.setShowBoneAxes);

  const vertexCount = getArmRig().geometry.attributes.position?.count ?? 1;

  return (
    <div>
      <SectionTitle>四种空间,一个顶点的旅程</SectionTitle>
      <P>一个顶点从「数据」变成「屏幕上的位置」,要穿过几个坐标空间:</P>
      <P>
        <Term color="#a78bfa">① Local / Mesh 空间</Term> — 顶点在几何体里存的原始坐标,
        相对 mesh 自身原点,<Term>永远不变</Term>。
      </P>
      <P>
        <Term color="#f43f5e">② Bone 空间</Term> — 通过 <Code>boneInverse</Code>
        把顶点拉进某根骨骼的局部坐标系;骨骼运动在这里发生。
      </P>
      <P>
        <Term color="#4ade80">③ 回到 Mesh 空间</Term> — 各骨骼的结果加权混合后,
        再经 <Code>bindMatrixInverse</Code> 合回 mesh 空间。
      </P>
      <P>
        <Term color="#38bdf8">④ World 空间</Term> — 乘 <Code>mesh.matrixWorld</Code>,
        放进整个场景。相机看到的就是这里。
      </P>

      <Callout tone="key">
        关键直觉:<Term>local 坐标恒定不变</Term>,变形完全来自骨骼矩阵。
        平移整个 mesh,顶点的 <Term>world</Term> 变了,但 <Term>local</Term> 一动不动。
      </Callout>

      <SectionTitle>动手观察</SectionTitle>
      <P>
        切换探针顶点,实时看它在 local 与 world 下的坐标;再平移 mesh 或弯曲骨骼,
        对比哪个空间的数值变了。
      </P>

      <MatrixInspector />

      <ControlGroup title="探针顶点">
        <Slider
          label="vertex id"
          value={probeVertexId}
          min={0}
          max={vertexCount - 1}
          step={1}
          onChange={setProbeVertexId}
        />
      </ControlGroup>

      <ControlGroup title="整体平移 mesh (world 变, local 不变)">
        <Slider label="X" value={meshOffset[0]} min={-3} max={3} step={0.1} onChange={(x) => setMeshOffset([x, meshOffset[1], meshOffset[2]])} />
        <Slider label="Y" value={meshOffset[1]} min={-1} max={3} step={0.1} onChange={(y) => setMeshOffset([meshOffset[0], y, meshOffset[2]])} />
        <Slider label="Z" value={meshOffset[2]} min={-3} max={3} step={0.1} onChange={(z) => setMeshOffset([meshOffset[0], meshOffset[1], z])} />
      </ControlGroup>

      <ControlGroup title="坐标轴 gizmo">
        <Toggle label="World 原点轴 (大)" checked={showWorldAxes} onChange={setShowWorldAxes} />
        <Toggle label="Bone local 轴" checked={showBoneAxes} onChange={setShowBoneAxes} />
      </ControlGroup>

      <PoseControls />
    </div>
  );
}
