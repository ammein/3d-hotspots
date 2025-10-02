import { EffectComposer } from '@react-three/postprocessing';
import { FogEffect } from '@/components/effect/FogPostProcessing';

/**
 *
 * @param {import('react').ComponentProps<{ uniforms: import('three').Uniform, children}>} uniforms
 * @returns
 */
export default function Fog({ uniforms, children }) {
  return (
    <EffectComposer>
      {children}
      <FogEffect
        uniforms={{
          ...uniforms,
        }}
      />
    </EffectComposer>
  );
}

Fog.displayName = 'Fog Postprocessing';
