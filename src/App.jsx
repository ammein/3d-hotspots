import { useState } from "react";
import "./App.css";
import { Canvas } from "@react-three/fiber";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import I18nProvider from "@/components/AppManagement";
import Splash from "@/components/screens/splash";
import Model from "@/components/Model";

gsap.registerPlugin(useGSAP);

function App() {
	const [count, setCount] = useState(0);

	return (
		<I18nProvider>
			<Splash />
			<Canvas
				style={{
					width: "100dvh",
					height: "100dvh",
				}}
			>
				<Model url={"/model-transformed.glb"} />
			</Canvas>
		</I18nProvider>
	);
}

export default App;
