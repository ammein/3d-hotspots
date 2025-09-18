import { EffectComposer } from "@react-three/postprocessing";
import { FogEffect } from "@/components/effect/FogPostProcessing";

/**
 *
 * @param {import('react').ComponentProps<import('three').Uniform>} uniforms
 * @returns
 */
export default function Fog(uniforms) {
  return (
    <EffectComposer>
      <FogEffect
        uniforms={{
          ...uniforms,
        }}
      />
    </EffectComposer>
  );
}

Fog.displayName = "Fog Postprocessing";
