import { BONE_COLORS } from '@/utils/skinning';

import { PoseControls, VisToggles } from './SharedControls';
import { Callout, Code, P, SectionTitle, Term } from '../prose';

/** 第 1 章:骨架与层级。 */
export function Chapter1() {
  return (
    <div>
      <SectionTitle>骨骼是带父子关系的 transform 节点</SectionTitle>
      <P>
        一根 <Term>Bone</Term> 本质就是一个 <Code>Object3D</Code>:它有自己的 position /
        rotation / scale,这些是相对于<Term>父节点</Term>的 <Term color={BONE_COLORS[1]}>local transform</Term>。
      </P>
      <P>
        我们的手臂有 3 根骨骼串联:
        <Term color={BONE_COLORS[0]}> shoulder</Term> →
        <Term color={BONE_COLORS[1]}> elbow</Term> →
        <Term color={BONE_COLORS[2]}> wrist</Term>。
        elbow 是 shoulder 的子节点,wrist 又是 elbow 的子节点。
      </P>
      <P>
        把每根骨骼自己的 local 矩阵沿层级一路相乘,就得到它的{' '}
        <Term>world transform</Term>:
      </P>
      <Callout tone="key">
        <Code>worldₙ = world_parent × localₙ</Code>
        <br />
        所以旋转 shoulder 时,elbow 和 wrist 会被「带着走」——这就是<Term>正向运动学 (FK)</Term>。
      </Callout>
      <P>
        拖动下面的滑块旋转某根骨骼,观察它的子骨骼如何跟随。注意每根骨骼上的<Term>坐标轴
        gizmo</Term> 表示它的 local 朝向。
      </P>

      <PoseControls />
      <VisToggles />

      <Callout tone="info">
        术语提醒:严格说 <Term>Joint(关节)</Term> 是变换中心点,<Term>Bone(骨头)</Term>
        是两个关节之间的可视连段。Three.js 里只有 <Code>Bone</Code> 对象,它实际扮演的是
        joint 的角色。
      </Callout>
    </div>
  );
}
