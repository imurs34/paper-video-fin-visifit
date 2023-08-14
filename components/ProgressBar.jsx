import styled from 'styled-components';
import { useAtom } from 'jotai';
import { useRef, useState  } from 'react';
import { highlightAtom, percentAtom } from '../atom';
import timelineColour from '../timelineColour.json';

function Control({ jump }) {
  const [percent] = useAtom(percentAtom);
  const ref = useRef();
  const [, setHighlightAtom] = useAtom(highlightAtom);
  const jumpToPlay = (e) => {
    setHighlightAtom(null);
    const percentPoint = e.nativeEvent.offsetX / ref.current.offsetWidth;
    jump(percentPoint);
  };

  const createLabel = () => {
    const body = document.querySelector('body');
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.color = 'white';
    div.style.textShadow = '4px 4px 4px rgba(0, 0, 0, 0.5)';
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    div.style.padding = '4px';
    div.style.borderRadius = '4px';
    div.classList.add('thelabel');
    div.style.transform = 'translateX(-50%)'
    body.style.position = 'relative';
    return div;
  };

  const handleMouseMove = (e) => {
    const list = document.querySelectorAll('.linePoint');
    const body = document.querySelector('body');

    const div = createLabel();
    const label = document.querySelector('.thelabel');
    if (label) body.removeChild(label);
    
    list.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const elementWidth = item.offsetWidth;
      
      if (e.clientX > rect.x && e.clientX < rect.x + elementWidth) {
        div.innerText = timelineColour[index].label;
        div.style.top = `${rect.y - 36}px`;
        div.style.left = `${e.clientX}px`;
        body.appendChild(div);
      }
    });
  };

  const handleMouseOut = () => {
    const label = document.querySelector('.thelabel');
    if (label) document.querySelector('body').removeChild(label);
  };

  return (
    <ProgressBarLine 
      onClick={jumpToPlay} 
      ref={ref}
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseOut={handleMouseOut}
    >
      <ProgressBarFilled percent={percent} />
    </ProgressBarLine>
  );
}

const ProgressBarLine = styled.div`
  display: flex;
  width: 100%;
  height: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: #adadad;
  cursor: pointer;
`;

const ProgressBarFilled = styled.div`
  color: white;
  flex-basis: ${(props) => props.percent}%;
  background-color: rgba(0, 0, 0, 0.6);
  height: 10px;
  position: relative;
  z-index: 200;
`;

export default Control;
