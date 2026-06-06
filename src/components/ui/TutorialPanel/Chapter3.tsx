import { useTutorialStore } from '@/store/useTutorialStore';
import { BONE_COLORS, BONE_LABELS } from '@/utils/skinning';

import { PoseControls } from './SharedControls';
import { Segmented, Slider, Toggle } from '../controls';
import { Callout, Code, ControlGroup, Formula, P, SectionTitle, Term } from '../prose';

/** 第 3 章:线性混合蒙皮 (LBS) 原理。 */
export function Chapter3() {
  const blendWidth = useTutorialStore((s) => s.blendWidth);
  const showWeights = useTutorialStore((s) => s.showWeights);
  const soloBone = useTutorialStore((s) => s.soloBone);
  const setBlendWidth = useTutorialStore((s) => s.setBlendWidth);
  const setShowWeights = useTutorialStore((s) => s.setShowWeights);
  const setSoloBone = useTutorialStore((s) => s.setSoloBone);

  return (
    <div>
      <SectionTitle>蒙皮:让顶点跟随多根骨骼</SectionTitle>
      <P>
        每个顶点存了最多 4 组 <Code>(skinIndex, skinWeight)</Code>:它受哪些骨骼影响、
        各占多少权重(权重之和 = 1)。最终顶点位置是各骨骼变换结果的<Term>加权平均</Term>:
      </P>
      <Formula>v′ = Σ wᵢ · (boneMatrixᵢ · boneInverseᵢ) · v</Formula>
      <P>
        这就是 <Term>线性混合蒙皮 (Linear Blend Skinning, LBS)</Term>,也叫 skeletal
        subspace deformation,是实时引擎最常用的方案。
      </P>

      <Callout tone="info">
        打开<Term>权重热力图</Term>:RGB 三通道分别表示
        <Term color={BONE_COLORS[0]}> shoulder</Term>/
        <Term color={BONE_COLORS[1]}> elbow</Term>/
        <Term color={BONE_COLORS[2]}> wrist</Term> 的权重。
        关节处的颜色过渡带 = 两根骨骼共同影响的区域。
      </Callout>

      <ControlGroup title="权重可视化">
        <Toggle label="权重热力图" checked={showWeights} onChange={setShowWeights} />
        <Segmented
          value={soloBone}
          onChange={setSoloBone}
          options={[
            { label: '全部', value: null },
            { label: BONE_LABELS[0], value: 0, color: BONE_COLORS[0] },
            { label: BONE_LABELS[1], value: 1, color: BONE_COLORS[1] },
            { label: BONE_LABELS[2], value: 2, color: BONE_COLORS[2] },
          ]}
        />
      </ControlGroup>

      <SectionTitle>硬绑定 vs 平滑权重</SectionTitle>
      <P>
        把<Term>过渡带宽度</Term>调到 0,每个顶点只完全属于一根骨骼(硬绑定)。
        弯曲关节时,接缝处会出现<Term>撕裂 / 错位</Term>。加大过渡带,接缝就平滑了。
      </P>

      <ControlGroup title="权重过渡带">
        <Slider
          label="blend width"
          value={blendWidth}
          min={0}
          max={1.5}
          step={0.05}
          onChange={setBlendWidth}
        />
      </ControlGroup>

      <PoseControls />

      <Callout tone="warn">
        LBS 的固有缺陷:关节大角度弯曲时,加权平均会让体积<Term>塌陷</Term>(俗称
        candy-wrapper / 关节缩水)。把 elbow 拧到 ±120° 就能看到。
        高级方案如 <Term>dual quaternion skinning</Term> 可缓解,但更昂贵。
      </Callout>
    </div>
  );
}
