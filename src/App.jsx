import { useState } from "react";
import "./App.css";
import { Canvas } from "@react-three/fiber";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import I18nProvider from "./components/AppManagement";
import Splash from "./components/screens/splash";

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
			></Canvas>
		</I18nProvider>
	);
}

export default App;
