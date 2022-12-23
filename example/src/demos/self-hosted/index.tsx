import React, { useEffect, useRef } from 'react';
import style from '../style.module.css';
import { setupScene } from './three-scene';

// REACT COMPONENT ------------------------------------------------

export default function Demo() {
  const containerRef = useRef(null);
  const sceneRef = useRef<any>(null);

  useEffect(()=>{
    if (containerRef.current) {
      sceneRef.current = setupScene(containerRef.current);
    }
    return ()=>{
      sceneRef.current && sceneRef.current();
    }
  }, [containerRef.current]);

  return (
    <div className={style.container} ref={containerRef}></div>
  );
}
