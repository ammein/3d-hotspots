import { forwardRef, useMemo } from "react";
import { Uniform } from "three";
import { Effect, EffectAttribute } from "postprocessing";
import fragmentShader from "@/shader/main.frag";

// Effect implementation
class FogEffectImpl extends Effect {
	constructor({ focalRange = 10.0 } = {}) {
		super("FogEffect", fragmentShader, {
			attributes: EffectAttribute.DEPTH,
			uniforms: new Map([["focalRange", new Uniform(focalRange)]]),
		});
		this.uFocalRange = focalRange;
	}

	update() {
		this.uniforms.get("focalRange").value = this.uFocalRange;
	}
}

export const FogEffect = forwardRef(({ uniforms }, ref) => {
	const effect = useMemo(() => new FogEffectImpl(uniforms), [uniforms]);
	return <primitive ref={ref} object={effect} dispose={null} />;
});
