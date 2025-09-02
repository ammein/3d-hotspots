import { useFrame } from '@react-three/fiber'
import styled from 'styled-components'

function Splash(){

    const SplashContainer = styled.div`
        width: "75%";
        height: auto;
        background: #FFF;
        background-blend-mode: color-burn;
        backdrop-filter: blur(5px);
        
    `;

    useFrame(() => {
        
    })

    return (
        <SplashContainer>
            
        </SplashContainer>
    )
}

export default Splash