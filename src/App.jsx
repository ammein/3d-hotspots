import { useState } from "react";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AppProvider from "@/components/context/AppManagement";
import Splash from "@/components/screens/splash";
import Main from "./components/screens/main";

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
				<Main />
			</Canvas>
		</AppProvider>
	);
}

export default App;
