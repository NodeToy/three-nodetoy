import React, { useEffect, useRef, useState} from 'react';
import style from './style.module.css';
import { setupScene, onChangeBodyColor, onChangeRimColor, onChangeDetailsColor } from './nodetoy-three-scene';

// REACT COMPONENT ------------------------------------------------

export default function Demo() {
  const containerRef = useRef(null);
  const sceneRef = useRef<any>(null);

  const [bodyColor, setBodyColor] = useState("#ff000d");
  const [rimColor, setRimColor] = useState("#9900ff");
  const [detailsColor, setDetailsColor] = useState("#04ff00");

  function onChangeBody(event: any) {
    setBodyColor(event.target.value);
    onChangeBodyColor(event);
  }
  function onChangeRim(event: any) {
    setRimColor(event.target.value);
    onChangeRimColor(event);
  }
  function onChangeDetails(event: any) {
    setDetailsColor(event.target.value);
    onChangeDetailsColor(event);
  }

  useEffect(()=>{
    if (containerRef.current && !sceneRef.current) {
      sceneRef.current = setupScene(containerRef.current);
    }
    return ()=>{
      sceneRef.current && sceneRef.current();
    }
  }, []);

  return (
    <div>
      <header className={style.header}>
        <div className={style.info}>
          Ferrari 458 Italia model by <a href="https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6" target="_blank" rel="noopener">vicent091036</a>
        </div>
        <div className={style.colorPickers}>
          <span className={style.colorPicker}><input id="body-color" type="color" value={bodyColor} onChange={onChangeBody}/><br/>Body</span>
          <span className={style.colorPicker}><input id="ror" type="color" value={rimColor} onChange={onChangeRim}/><br/>Rim</span>
          <span className={style.colorPicker}><input id="details-color" type="color" value={detailsColor} onChange={onChangeDetails}/><br/>Details</span>
        </div>
      </header>
      <div className={style.container} ref={containerRef}></div>
    </div>
  );
}
