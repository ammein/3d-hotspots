import { useMemo } from 'react';
import { Color, Uniform } from 'three';
import { Effect, EffectAttribute } from 'postprocessing';
import fragmentShader from '@/glsl/main.frag';

/**
 * @typedef {Object} FogEffect
 * @property {number} focalRange
 * @property {import('three').Color} fogColor
 */

// Effect implementation
class FogEffectImpl extends Effect {
  constructor({ focalRange = 10.0, fogColor = new Color('#FFFFFF') } = {}) {
    super('FogEffect', fragmentShader, {
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map([
        ['focalRange', new Uniform(focalRange)],
        ['fogColor', new Uniform(fogColor)],
      ]),
    });
    this.uFocalRange = focalRange;
    this.uFogColor = fogColor;
  }

  update() {
    this.uniforms.get('focalRange').value = this.uFocalRange;
    this.uniforms.get('fogColor').value = this.uFogColor;
  }
}

/**
 * Fog Effect
 * @param {{ uniforms: import('three').Uniform<FogEffect>, ref: import('react').Ref<import('postprocessing').Effect> }}
 */
export const FogEffect = ({ uniforms, ref }) => {
  const effect = useMemo(() => new FogEffectImpl(uniforms), [uniforms]);
  return <primitive ref={ref} object={effect} dispose={null} />;
};

FogEffect.displayName = 'Fog Postprocessing';
