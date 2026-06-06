import * as THREE from 'three';

/**
 * 手臂几何与骨架的构建逻辑(教学核心)。
 *
 * 手臂沿 +Y 方向,从 y=0 延伸到 y=ARM_LENGTH,由 3 根骨骼串联:
 *   bone0 (shoulder) 原点 y=0
 *   bone1 (elbow)    原点 y=1(bone0 的子节点,local y=+1)
 *   bone2 (wrist)    原点 y=2(bone1 的子节点,local y=+1)
 * 关节边界落在 y=1 与 y=2 处,蒙皮权重在边界附近做混合过渡。
 */

export const SEGMENT_LENGTH = 1; // 每根骨骼长度
export const BONE_COUNT = 3;
export const ARM_LENGTH = SEGMENT_LENGTH * BONE_COUNT; // 3
export const ARM_RADIUS = 0.35;

/** 关节边界高度:y=1(bone0↔bone1)、y=2(bone1↔bone2)。 */
const JOINT_HEIGHTS = [1, 2] as const;

/** 各骨骼对应的热力图颜色(同时也是权重→RGB 的语义:r=bone0, g=bone1, b=bone2)。 */
export const BONE_COLORS = ['#f43f5e', '#4ade80', '#38bdf8'] as const;
export const BONE_LABELS = ['shoulder', 'elbow', 'wrist'] as const;

/** smoothstep:在 [edge0, edge1] 之间平滑从 0 过渡到 1。 */
function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1; // 退化为硬阶跃(blendWidth=0)
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * 计算某高度 y 处顶点对 3 根骨骼的权重。
 * blendWidth=0 → 硬绑定(阶跃,关节处会撕裂);>0 → 平滑混合带。
 * 返回值已归一化(三者之和恒为 1)。
 */
export function computeBoneWeights(y: number, blendWidth: number): [number, number, number] {
  const hw = blendWidth / 2;
  // t1: 跨越 y=1 的过渡(0→1);t2: 跨越 y=2 的过渡。
  const t1 = smoothstep(JOINT_HEIGHTS[0] - hw, JOINT_HEIGHTS[0] + hw, y);
  const t2 = smoothstep(JOINT_HEIGHTS[1] - hw, JOINT_HEIGHTS[1] + hw, y);
  // bone0 在 y<1 占主导;bone1 在 1<y<2;bone2 在 y>2。t1≥t2 保证非负。
  return [1 - t1, t1 - t2, t2];
}

/**
 * 构建沿 +Y 的圆柱几何,并写入 skinIndex / skinWeight 顶点属性。
 * 几何原点在 y=0(底部),顶部在 y=ARM_LENGTH。
 */
export function buildArmGeometry(blendWidth: number): THREE.BufferGeometry {
  const radialSegments = 20;
  const heightSegments = 48;
  const geo = new THREE.CylinderGeometry(
    ARM_RADIUS,
    ARM_RADIUS,
    ARM_LENGTH,
    radialSegments,
    heightSegments,
  );
  // CylinderGeometry 默认中心在原点(y ∈ [-L/2, L/2]),平移使底部落在 y=0。
  geo.translate(0, ARM_LENGTH / 2, 0);

  assignSkinWeights(geo, blendWidth);
  return geo;
}

/**
 * 根据每个顶点的高度重新计算并写入 skinIndex / skinWeight 属性。
 * blendWidth 改变时调用即可,无需重建几何。
 */
export function assignSkinWeights(geo: THREE.BufferGeometry, blendWidth: number): void {
  const pos = geo.attributes.position;
  if (!pos) throw new Error('geometry missing position attribute');
  const count = pos.count;
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];

  for (let i = 0; i < count; i++) {
    const y = pos.getY(i);
    const [w0, w1, w2] = computeBoneWeights(y, blendWidth);
    // 固定使用骨骼 0/1/2 三个索引,第四分量留空。
    skinIndices.push(0, 1, 2, 0);
    skinWeights.push(w0, w1, w2, 0);
  }

  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
}

/**
 * 创建手臂骨架:3 根 Bone 串联,沿 +Y 每节相距 SEGMENT_LENGTH。
 * 返回根骨骼(需 add 到 SkinnedMesh)、骨骼数组与 Skeleton。
 */
export function createArmSkeleton(): {
  bones: THREE.Bone[];
  root: THREE.Bone;
  skeleton: THREE.Skeleton;
} {
  const bones: THREE.Bone[] = [];
  for (let i = 0; i < BONE_COUNT; i++) {
    const bone = new THREE.Bone();
    bone.name = BONE_LABELS[i]!;
    // 根骨骼在原点;其余骨骼相对父节点 local y=+SEGMENT_LENGTH。
    bone.position.y = i === 0 ? 0 : SEGMENT_LENGTH;
    if (i > 0) bones[i - 1]!.add(bone);
    bones.push(bone);
  }
  const skeleton = new THREE.Skeleton(bones);
  return { bones, root: bones[0]!, skeleton };
}

/**
 * 权重 → 顶点颜色。
 * soloBone=null:用 RGB 直接表示三骨骼混合(barycentric,直观看出过渡带);
 * soloBone=0/1/2:只看该骨骼,白→该骨骼颜色按权重插值。
 */
export function buildWeightColors(
  geo: THREE.BufferGeometry,
  blendWidth: number,
  soloBone: number | null,
): THREE.BufferAttribute {
  const pos = geo.attributes.position;
  if (!pos) throw new Error('geometry missing position attribute');
  const count = pos.count;
  const colors = new Float32Array(count * 3);

  const solo = soloBone === null ? null : new THREE.Color(BONE_COLORS[soloBone]!);
  const dim = new THREE.Color('#1f2937');

  for (let i = 0; i < count; i++) {
    const y = pos.getY(i);
    const w = computeBoneWeights(y, blendWidth);
    if (solo === null) {
      colors[i * 3] = w[0];
      colors[i * 3 + 1] = w[1];
      colors[i * 3 + 2] = w[2];
    } else {
      const c = dim.clone().lerp(solo, w[soloBone!]!);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
  }
  return new THREE.BufferAttribute(colors, 3);
}

/** 一整套手臂蒙皮装配:几何、材质、骨骼、Skeleton 与 SkinnedMesh。 */
export interface ArmRig {
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
  bones: THREE.Bone[];
  skeleton: THREE.Skeleton;
  mesh: THREE.SkinnedMesh;
}

/**
 * 组装完整的 SkinnedMesh:把根骨骼挂到 mesh 上,并调用 bind()。
 * bind() 会以骨骼此刻(rest pose)的世界矩阵计算 inverse bind matrices。
 */
export function createArmRig(blendWidth: number): ArmRig {
  const geometry = buildArmGeometry(blendWidth);
  const material = new THREE.MeshStandardMaterial({
    color: '#c9d1d9',
    roughness: 0.6,
    metalness: 0.1,
    vertexColors: false,
  });

  const { bones, root, skeleton } = createArmSkeleton();
  const mesh = new THREE.SkinnedMesh(geometry, material);
  mesh.add(root);
  mesh.bind(skeleton);

  return { geometry, material, bones, skeleton, mesh };
}

/**
 * 模块级单例 rig。本教程全程只有一只手臂,单例让 canvas 组件与 UI 面板
 * 都能读到同一套 live 骨骼/矩阵,而无需跨 Canvas 边界 prop drilling。
 */
let singletonRig: ArmRig | null = null;

export function getArmRig(): ArmRig {
  if (!singletonRig) {
    singletonRig = createArmRig(0.6);
  }
  return singletonRig;
}

// ── LBS 的 CPU 等价实现,用于在面板中展示某顶点的蒙皮后坐标 ──
const _pos = new THREE.Vector3();
const _skinned = new THREE.Vector3();
const _bound = new THREE.Vector3();
const _skinIndex = new THREE.Vector4();
const _skinWeight = new THREE.Vector4();
const _boneMatrix = new THREE.Matrix4();
const _contrib = new THREE.Vector3();

/**
 * 复刻线性混合蒙皮,计算某顶点经蒙皮后的 world 坐标。
 * 这是 Three.js GPU 蒙皮在 CPU 上的等价实现,用于在面板里展示数值。
 */
export function getSkinnedVertexWorld(vertexId: number): THREE.Vector3 | null {
  const rig = getArmRig();
  const { mesh, geometry: geo, skeleton } = rig;
  const posAttr = geo.attributes.position;
  const skinIdxAttr = geo.attributes.skinIndex;
  const skinWgtAttr = geo.attributes.skinWeight;
  if (!posAttr || !skinIdxAttr || !skinWgtAttr) return null;
  if (vertexId < 0 || vertexId >= posAttr.count) return null;

  _pos.fromBufferAttribute(posAttr as THREE.BufferAttribute, vertexId);
  _skinIndex.fromBufferAttribute(skinIdxAttr as THREE.BufferAttribute, vertexId);
  _skinWeight.fromBufferAttribute(skinWgtAttr as THREE.BufferAttribute, vertexId);

  // 顶点先经 bindMatrix 进入骨骼绑定空间。
  _bound.copy(_pos).applyMatrix4(mesh.bindMatrix);

  _skinned.set(0, 0, 0);
  const indices = [_skinIndex.x, _skinIndex.y, _skinIndex.z, _skinIndex.w];
  const weights = [_skinWeight.x, _skinWeight.y, _skinWeight.z, _skinWeight.w];

  for (let i = 0; i < 4; i++) {
    const w = weights[i]!;
    if (w === 0) continue;
    // skeleton.boneMatrices 即每根骨骼的 boneMatrix × inverseBindMatrix。
    _boneMatrix.fromArray(skeleton.boneMatrices, indices[i]! * 16);
    _contrib.copy(_bound).applyMatrix4(_boneMatrix).multiplyScalar(w);
    _skinned.add(_contrib);
  }

  // 再经 bindMatrixInverse 回到 mesh 空间,最后乘 mesh.matrixWorld 得 world。
  _skinned.applyMatrix4(mesh.bindMatrixInverse);
  _skinned.applyMatrix4(mesh.matrixWorld);
  return _skinned.clone();
}



