import { useTutorialStore } from '@/store/useTutorialStore';

import { PoseControls } from './SharedControls';
import { Segmented } from '../controls';
import { Callout, Code, ControlGroup, Formula, P, SectionTitle, Term } from '../prose';

/** 第 2 章:Rest Pose 与 Bind Pose。 */
export function Chapter2() {
  const bindMode = useTutorialStore((s) => s.bindMode);
  const rebind = useTutorialStore((s) => s.rebind);

  return (
    <div>
      <SectionTitle>Rest Pose vs Bind Pose</SectionTitle>
      <P>
        <Term>Rest Pose</Term>(也叫 reference pose)是骨架「什么都没做」时的默认姿态——
        我们手臂里就是三根骨骼笔直朝上。
      </P>
      <P>
        <Term>Bind Pose</Term> 是<Term>蒙皮绑定那一刻</Term>骨架所处的姿态。绑定时,
        Three.js 会为每根骨骼记录一个 <Code>boneInverse</Code>(
        <Term>inverse bind matrix</Term>):
      </P>
      <Formula>boneInverse = (bone.matrixWorld at bind time)⁻¹</Formula>
      <P>
        它的作用是把顶点从 <Term>mesh 空间</Term>「拉回」到每根骨骼的<Term>局部空间</Term>,
        这样之后骨骼怎么动,顶点就能跟着正确地动。
      </P>

      <Callout tone="key">
        为什么需要 <Term>逆</Term>矩阵?因为蒙皮要算的是「相对绑定姿态<Term>变化了多少</Term>」。
        <Code>boneMatrix × boneInverse</Code> 在绑定姿态下恰好等于单位阵 → 顶点纹丝不动;
        骨骼一旦偏离绑定姿态,这个乘积才产生位移。
      </Callout>

      <SectionTitle>动手:换个姿态重新绑定</SectionTitle>
      <P>
        先用滑块把手臂弯成某个姿态,然后点「在当前姿态绑定」。绑定基准变成了弯曲姿态——
        再回到笔直姿态时,网格反而会<Term>反向扭曲</Term>,因为现在「笔直」成了偏离绑定的状态。
      </P>

      <PoseControls />

      <ControlGroup title="绑定基准 (bind pose)">
        <Segmented
          value={bindMode}
          onChange={(v) => rebind(v)}
          options={[
            { label: '以 Rest 绑定', value: 'rest' },
            { label: '以当前姿态绑定', value: 'posed' },
          ]}
        />
        <button
          onClick={() => rebind(bindMode)}
          className="w-full rounded bg-white/10 py-1 text-xs text-white/70 hover:bg-white/20"
        >
          重新绑定 (rebind)
        </button>
      </ControlGroup>

      <Callout tone="warn">
        真实管线中,美术几乎总是在 <Term>T-pose / A-pose</Term> 这种「展开」姿态下绑定,
        正是为了让 inverse bind matrix 干净、权重好刷。错误的 bind pose 会让后续所有动画都变形。
      </Callout>
    </div>
  );
}
