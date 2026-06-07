import { Callout, Code, Formula, P, SectionTitle, Term } from '../prose';

interface ApiRow {
  api: string;
  desc: string;
}

const API_ROWS: ApiRow[] = [
  { api: 'THREE.Bone', desc: '骨骼节点,本质是 Object3D,有父子层级与 local transform' },
  { api: 'THREE.Skeleton', desc: '一组 bones + 每根的 boneInverse(inverse bind matrix)' },
  { api: 'THREE.SkinnedMesh', desc: '绑定了骨架的网格,GPU 上执行 LBS' },
  { api: 'mesh.bind(skeleton, bindMatrix?)', desc: '绑定:记录 bindMatrix 并计算各 boneInverse' },
  { api: 'mesh.bindMatrix', desc: 'mesh 空间 → 绑定时世界空间' },
  { api: 'mesh.bindMatrixInverse', desc: 'bindMatrix 的逆,把蒙皮结果合回 mesh 空间' },
  { api: 'skeleton.boneInverses[i]', desc: '第 i 根骨骼的 inverse bind matrix' },
  { api: 'skeleton.boneMatrices', desc: '每帧更新的 boneMatrix×boneInverse 扁平数组,送进 shader' },
  { api: 'skeleton.calculateInverses()', desc: '按当前骨骼世界矩阵重算所有 boneInverse' },
  { api: 'geometry.skinIndex / skinWeight', desc: '每顶点 4 组骨骼索引与权重(vec4)' },
];

/** 第 5 章:速查总览。 */
export function Chapter5() {
  return (
    <div>
      <SectionTitle>核心公式</SectionTitle>
      <Formula>v′ = Σᵢ wᵢ · (boneMatrixᵢ · boneInverseᵢ) · v_bind</Formula>
      <P>
        其中 <Code>boneInverseᵢ</Code> = 绑定时骨骼世界矩阵的逆,
        <Code>boneMatrixᵢ</Code> = 当前帧骨骼世界矩阵,
        <Code>wᵢ</Code> = 该骨骼权重(Σwᵢ=1)。
      </P>

      <SectionTitle>四个空间一句话</SectionTitle>
      <P>
        <Term color="#a78bfa">Local/Mesh</Term>:顶点原始坐标,不变。
      </P>
      <P>
        <Term color="#f43f5e">Bone</Term>:骨骼局部系,变形发生处。
      </P>
      <P>
        <Term color="#4ade80">Mesh(合回)</Term>:加权混合后回到 mesh。
      </P>
      <P>
        <Term color="#38bdf8">World</Term>:乘 matrixWorld 进场景。
      </P>

      <SectionTitle>Rest vs Bind 一句话</SectionTitle>
      <P>
        <Term>Rest</Term> = 骨架默认静止姿态;<Term>Bind</Term> = 绑定那一刻的姿态,
        决定了 <Code>boneInverse</Code>。两者常常相同(都在 T-pose),但概念不同。
      </P>

      <SectionTitle>Three.js API 速查</SectionTitle>
      <div className="my-2 overflow-hidden rounded-md border border-white/10">
        {API_ROWS.map((row, i) => (
          <div
            key={row.api}
            className={i % 2 === 0 ? 'bg-white/[0.03] px-3 py-1.5' : 'px-3 py-1.5'}
          >
            <code className="font-mono text-[11px] text-sky-200">{row.api}</code>
            <div className="text-[11px] leading-snug text-white/60">{row.desc}</div>
          </div>
        ))}
      </div>

      <Callout tone="key">
        一句话串起来:<Term>绑定</Term>时记下 boneInverse(把顶点送进骨骼空间的钥匙);
        <Term>每帧</Term>用 boneMatrix×boneInverse 算出每根骨骼让顶点移动多少;
        按 <Term>权重</Term>混合;最后变换回 world 给相机看。
      </Callout>

      <Callout tone="info">
        想继续深入:dual quaternion skinning(消除体积塌陷)、
        morph target(表情/形变)、IK(反向运动学)、animation clip 与
        <Code>AnimationMixer</Code>(关键帧驱动骨骼)。
      </Callout>
    </div>
  );
}
