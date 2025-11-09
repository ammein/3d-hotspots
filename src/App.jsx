import { useCallback, useState } from 'react';
import '@/stylesheets/App.css';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AppProvider from '@/components/context/AppManagement';
import ModelProvider from '@/components/context/ModelManagement';
import Splash from '@/components/scenes/splash';
import Main from '@/components/scenes/main';
import NodeGraph from '@/components/scenes/node-graph';
import withLoading from '@/components/hoc/LoadingScreen';
import TextPlugin from 'gsap/TextPlugin';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';
import AppCSS from '@/stylesheets/modules/App.module.css';

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
      <Splash callback={startCallback} start={start} loaded={loaded} />
      <Canvas
        gl={{
          preserveDrawingBuffer: import.meta.env.DEV,
          antialias: true,
        }}
        dpr={[1, 2]}
        className={AppCSS.Canvas}
      >
        <ModelProvider>
          <Main start={start} loaded={animated} />
          <NodeGraph start={start} loaded={animated} />
        </ModelProvider>
      </Canvas>
    </>
  );
}

const InnerAppLoads = withLoading(InnerApp);

function App(_props) {
  return (
    <AppProvider>
      <InnerAppLoads />
    </AppProvider>
  );
}

export default App;
