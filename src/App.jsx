import { useState } from 'react'
import './App.css'
import { Canvas } from '@react-three/fiber'

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import withAppManagement from './components/hoc/App-Management';

gsap.registerPlugin(useGSAP);

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Canvas> 
      </Canvas>
    </>
  )
}

export default withAppManagement(App)
