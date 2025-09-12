import { useState } from "react";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AppProvider from "@/components/context/AppManagement";
import Splash from "@/components/screens/splash";
import Model from "@/components/Model";

gsap.registerPlugin(useGSAP);

function App() {
	const [count, setCount] = useState(0);

	return (
		<AppProvider>
			<Splash />
			<Canvas
				gl={{
					preserveDrawingBuffer: import.meta.env.DEV,
				}}
				style={{
					width: "100dvw",
					height: "100dvh",
				}}
			>
				<ambientLight intensity={Math.PI / 2.0} />
				<pointLight intensity={10} position={[0, 3, 0]} />
				<Model
					url={"/model/model-transformed.glb"}
					useDraco={true}
					useKTX2={true}
					animationNames={["Scene"]}
				/>
				<OrbitControls
					autoRotate={true}
					enableZoom={false}
					enablePan={false}
					enableRotate={false}
				/>
			</Canvas>
		</AppProvider>
	);
}

export default App;
