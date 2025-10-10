import { useCallback, useState } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AppProvider from '@/components/context/AppManagement';
import Splash from '@/components/screens/splash';
import Main from '@/components/screens/main';
import withLoading from '@/components/hoc/LoadingScreen';
import TextPlugin from 'gsap/TextPlugin';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(TextPlugin);
gsap.registerPlugin(ScrambleTextPlugin);

function InnerApp({ loaded }) {
  const [start, setStart] = useState(false);
  const [animated, setAnimation] = useState(false);

  const startCallback = useCallback((res) => {
    switch (res) {
      case 'start':
        setStart(true);
        break;

      case 'loaded':
        setAnimation(true);
        break;
    }
  }, []);

  return (
    <>
      <Splash callback={startCallback} loaded={loaded} />
      <Canvas
        gl={{
          preserveDrawingBuffer: import.meta.env.DEV,
          antialias: true,
        }}
        dpr={[1, 2]}
        style={{
          width: '100dvw',
          height: '100dvh',
        }}
      >
        <Main start={start} loaded={animated} />
      </Canvas>
    </>
  );
}

const InnerAppLoads = withLoading(InnerApp);

function App(props) {
  return (
    <AppProvider>
      <InnerAppLoads />
    </AppProvider>
  );
}

export default App;
