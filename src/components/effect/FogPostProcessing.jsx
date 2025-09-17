import { forwardRef, useMemo } from "react";
import { Color, Uniform } from "three";
import { Effect, EffectAttribute } from "postprocessing";
import fragmentShader from "@/glsl/main.frag";

// Effect implementation
class FogEffectImpl extends Effect {
	constructor({ focalRange = 10.0, fogColor = new Color("#FFFFFF") } = {}) {
		super("FogEffect", fragmentShader, {
			attributes: EffectAttribute.DEPTH,
			uniforms: new Map([
				["focalRange", new Uniform(focalRange)],
				["fogColor", new Uniform(fogColor)],
			]),
		});
		this.uFocalRange = focalRange;
		this.uFogColor = fogColor;
	}

	update() {
		this.uniforms.get("focalRange").value = this.uFocalRange;
		this.uniforms.get("fogColor").value = this.uFogColor;
	}
}

export const FogEffect = forwardRef(({ uniforms }, ref) => {
	const effect = useMemo(() => new FogEffectImpl(uniforms), [uniforms]);
	return <primitive ref={ref} object={effect} dispose={null} />;
});

FogEffect.displayName = "Fog Postprocessing";
