import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { CaptureKind } from './src/types';
import { PermissionScreen } from './src/screens/PermissionScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { ReviewScreen } from './src/screens/ReviewScreen';

type Captured = { uri: string; kind: CaptureKind };
type Phase = 'permission' | 'camera' | 'review';

export default function App() {
  const [phase, setPhase] = useState<Phase>('permission');
  const [captured, setCaptured] = useState<Captured | null>(null);

  return (
    <>
      <StatusBar style="light" />
      {phase === 'permission' && (
        <PermissionScreen onReady={() => setPhase('camera')} />
      )}
      {phase === 'camera' && (
        <CameraScreen
          onCaptured={(m) => {
            setCaptured(m);
            setPhase('review');
          }}
        />
      )}
      {phase === 'review' && captured && (
        <ReviewScreen
          uri={captured.uri}
          kind={captured.kind}
          onRetake={() => {
            setCaptured(null);
            setPhase('camera');
          }}
          onDone={() => {
            setCaptured(null);
            setPhase('camera');
          }}
        />
      )}
    </>
  );
}
