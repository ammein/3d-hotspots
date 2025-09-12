import { EffectComposer } from "@react-three/postprocessing";
import { FogEffect } from "@/components/effect/FogPostProcessing";

export default function Fog({ focalRange }) {
	return (
		<EffectComposer>
			<FogEffect
				uniforms={{
					focalRange,
				}}
			/>
		</EffectComposer>
	);
}

Fog.displayName = "Fog Postprocessing";
