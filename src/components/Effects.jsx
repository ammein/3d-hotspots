import { DepthOfField, EffectComposer } from '@react-three/postprocessing';
import { FogEffect } from '@/components/effect/FogPostProcessing';

/**
 * @typedef {Object} EffectsParams
 * @property {import('@/components/effect/FogPostProcessing').FogEffect} uniformsFog
 * @property {import('@react-three/postprocessing').AutofocusProps} depthProps
 * @property {import('react').Ref<import('@react-three/postprocessing').AutofocusProps>} depthRef
 * @property {import('react').Ref<import('@/components/effect/FogPostProcessing').FogEffect>} fogRef
 */

/**
 * Fog Effect
 * @param {EffectsParams} param0
 * @returns
 */
export default function Effects({ uniformsFog, depthProps, depthRef, fogRef }) {
  return (
    <EffectComposer>
      <DepthOfField ref={depthRef} {...depthProps} />
      <FogEffect
        ref={fogRef}
        uniforms={{
          ...uniformsFog,
        }}
      />
    </EffectComposer>
  );
}

Effects.displayName = 'Fog Postprocessing';
