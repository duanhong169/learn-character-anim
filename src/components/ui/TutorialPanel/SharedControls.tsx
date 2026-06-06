import { useTutorialStore } from '@/store/useTutorialStore';
import { BONE_COLORS } from '@/utils/skinning';

import { Slider, Toggle } from '../controls';
import { ControlGroup } from '../prose';

/** 三关节角度滑块 + 复位,跨章节复用。 */
export function PoseControls() {
  const shoulderDeg = useTutorialStore((s) => s.shoulderDeg);
  const elbowDeg = useTutorialStore((s) => s.elbowDeg);
  const wristDeg = useTutorialStore((s) => s.wristDeg);
  const setShoulderDeg = useTutorialStore((s) => s.setShoulderDeg);
  const setElbowDeg = useTutorialStore((s) => s.setElbowDeg);
  const setWristDeg = useTutorialStore((s) => s.setWristDeg);
  const resetPose = useTutorialStore((s) => s.resetPose);

  return (
    <ControlGroup title="关节角度 (绕 Z 轴)">
      <Slider label="shoulder" value={shoulderDeg} min={-90} max={90} unit="°" accent={BONE_COLORS[0]} onChange={setShoulderDeg} />
      <Slider label="elbow" value={elbowDeg} min={-120} max={120} unit="°" accent={BONE_COLORS[1]} onChange={setElbowDeg} />
      <Slider label="wrist" value={wristDeg} min={-90} max={90} unit="°" accent={BONE_COLORS[2]} onChange={setWristDeg} />
      <button
        onClick={resetPose}
        className="mt-1 w-full rounded bg-white/10 py-1 text-xs text-white/70 hover:bg-white/20"
      >
        复位姿态
      </button>
    </ControlGroup>
  );
}

/** 通用可视化开关(骨骼 / 皮肤 / 线框)。 */
export function VisToggles() {
  const showBones = useTutorialStore((s) => s.showBones);
  const showSkin = useTutorialStore((s) => s.showSkin);
  const wireframe = useTutorialStore((s) => s.wireframe);
  const setShowBones = useTutorialStore((s) => s.setShowBones);
  const setShowSkin = useTutorialStore((s) => s.setShowSkin);
  const setWireframe = useTutorialStore((s) => s.setWireframe);

  return (
    <ControlGroup title="显示">
      <Toggle label="显示骨骼" checked={showBones} onChange={setShowBones} />
      <Toggle label="显示皮肤 (mesh)" checked={showSkin} onChange={setShowSkin} />
      <Toggle label="线框模式" checked={wireframe} onChange={setWireframe} />
    </ControlGroup>
  );
}
