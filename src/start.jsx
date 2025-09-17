import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App.jsx";
import studio from "@theatre/studio";
import extension from "@theatre/r3f/dist/extension";

if (import.meta.env.DEV) {
	studio.initialize();
	studio.extend(extension);
}

window.downloadMissingKeys = () => {
	console.log("Downloading missing translation keys...");
	console.log(window.missingI18nKeys);
	const blob = new Blob([JSON.stringify(window.missingI18nKeys, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "missing_translations.json";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

createRoot(document.getElementsByTagName("bundle-3d-hotspots")[0]).render(
	<StrictMode>
		<App />
	</StrictMode>
);
