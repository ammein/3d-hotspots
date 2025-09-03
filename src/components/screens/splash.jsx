import { useFrame } from "@react-three/fiber";
import styled from "styled-components";
import tw from "tailwind-styled-components";
import withLoading from "../hoc/LoadingScreen";

const SplashStyles = styled.div`
	height: auto;
	background: #fff;
	background-blend-mode: color-burn;
	backdrop-filter: blur(5px);
`;

const SplashContainer = tw(SplashStyles)`
        fixed w-3/4
    `;

function Splash() {
	return <SplashContainer></SplashContainer>;
}

export default withLoading(Splash);
