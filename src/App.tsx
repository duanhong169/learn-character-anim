import { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf';

import { TutorialScene } from '@/components/canvas';
import { TutorialPanel } from '@/components/ui';

export function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [4, 3, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <TutorialScene />
        </Suspense>
        <Perf position="top-right" />
      </Canvas>
      <TutorialPanel />
    </div>
  );
}
