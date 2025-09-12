import { useRef, useState } from "react";
import useFontFaceObserver from "use-font-face-observer";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Button from "@/components/Button";
import { useApp } from "../context/AppManagement";

/**
 * HOC for App Components
 * @param {React.Component} WrappedComponent
 * @returns {React.Component}
 */
const withLoading = (WrappedComponent) => {
	return function LoadingManagement(props) {
		const context = useApp();
		const buttonLoadRef = useRef();
		const [assetName, setAssetName] = useState("");
		const [progress, setProgress] = useState(0);

		const progressRef = useRef({
			value: 0,
		});

		const isFontLoaded = useFontFaceObserver([
			{
				family: "3ds Bold",
				weight: "700",
			},
			{
				family: "3ds Bold Italic",
				weight: "700",
				style: "italic",
			},
			{
				family: "3ds Semibold",
				weight: "600",
			},
			{
				family: "3ds Semibold Italic",
				weight: "600",
				style: "italic",
			},
			{
				family: "3ds Regular",
				weight: "400",
			},
			{
				family: "3ds Italic",
				weight: "400",
				style: "italic",
			},
			{
				family: "3ds Light",
				weight: "300",
			},
			{
				family: "3ds Light Italic",
				weight: "300",
				style: "italic",
			},
		]);

		useGSAP(
			() => {
				if (isFontLoaded && context.ready) {
					gsap.to(progressRef.current, {
						value: 100,
						duration: 0.9,
						onStart: () => setAssetName("Font"),
						onUpdate: ({ value }) => setProgress(value),
						onUpdateParams: [progressRef.current],
						// onComplete: () =>
						// 	gsap.to(buttonLoadRef.current, {
						// 		delay: 1.0,
						// 		opacity: 0,
						// 		duration: 0.75,
						// 	}),
					});
				}
			},
			{
				dependencies: [isFontLoaded, context.ready],
			}
		);

		const loadText =
			context.ready && progress !== 100
				? context.msg("Loading") + " " + assetName
				: "Asset Loaded";

		return (
			<>
				{context.ready && (
					<Button
						ref={buttonLoadRef}
						disabled={progress !== 100}
						$buttonType="scream"
						$size="large"
						$weight="bold"
						$other={/* tailwindcss */ "mx-auto fixed"}
					>
						{progress.toFixed(0) + "% " + loadText}
					</Button>
				)}
				<WrappedComponent progress={progress} {...props} />
			</>
		);
	};
};

export default withLoading;
