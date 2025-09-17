import { useFrame } from "@react-three/fiber";
import withTheatreManagement from "../hoc/TheatreManagement";
import { types } from "@theatre/core";
import Model from "@/components/Model";
import { OrbitControls } from "@react-three/drei";

const ambientLightIntensity = Math.PI / 2.0;

const Main = (props) => {
	const MainTheatreJS = props.theatre;

	useFrame(({ gl, scene, camera }) => {
		gl.render(scene, camera);
	}, 1);

	return (
		<>
			<ambientLight intensity={ambientLightIntensity} />
			<pointLight intensity={10} position={[0, 3, 0]} />
			{MainTheatreJS &&
				MainTheatreJS.Scene &&
				MainTheatreJS.Scene.Main.model.length > 0 && (
					<Model
						url={MainTheatreJS.Scene.Main.model}
						useDraco={MainTheatreJS.Scene.Main.draco}
						useKTX2={MainTheatreJS.Scene.Main.ktx2}
						animationNames={
							MainTheatreJS.Scene.Main.animations.length > 0
								? MainTheatreJS.Scene.Main.animations.split(",")
								: []
						}
					/>
				)}
			<OrbitControls
				autoRotate={
					MainTheatreJS &&
					MainTheatreJS.Scene &&
					MainTheatreJS.Scene["Orbit Controls"].autoRotate
				}
				enableZoom={
					MainTheatreJS &&
					MainTheatreJS.Scene &&
					MainTheatreJS.Scene["Orbit Controls"].enableZoom
				}
				enablePan={
					MainTheatreJS &&
					MainTheatreJS.Scene &&
					MainTheatreJS.Scene["Orbit Controls"].enablePan
				}
				enableRotate={
					MainTheatreJS &&
					MainTheatreJS.Scene &&
					MainTheatreJS.Scene["Orbit Controls"].enableRotate
				}
			/>
		</>
	);
};

const MainScene = withTheatreManagement(Main, {
	Scene: {
		Main: {
			props: {
				draco: types.boolean(true, {
					label: "Use Draco Loader",
				}),
				ktx2: types.boolean(true, {
					label: "Use KTX2 Loader",
				}),
				model: types.string("", {
					label: "Model Asset",
				}),
				animations: types.string("", {
					label:
						"List of Animations (To activate multiple animations, use ',')",
				}),
			},
		},
		"Orbit Controls": {
			props: {
				autoRotate: types.boolean(true, {
					label: "Auto Rotate Model",
				}),
				enableZoom: types.boolean(false, {
					label: "Enable Zoom",
				}),
				enablePan: types.boolean(false, {
					label: "Enable Pan",
				}),
				enableRotate: types.boolean(false, {
					label: "Enable Rotate",
				}),
			},
		},
	},
});

export default MainScene;
