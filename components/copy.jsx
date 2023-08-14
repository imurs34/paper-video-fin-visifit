import styled from 'styled-components';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import timelineColour from '../timelineColour.json';

import { highlightAtom, percentAtom, currentTimeAtom, durationTimeAtom } from '../atom';
import { current } from '@reduxjs/toolkit';

const convertTime = (time) => {
  const [minutes, seconds] = time.split(':');
  return minutes * 60 + seconds;
}

function Control({ jump }) {
  const [percent] = useAtom(percentAtom);
  const ref = useRef();
  const [, setHighlightAtom] = useAtom(highlightAtom);
  const [time] = useAtom(currentTimeAtom);
  const [duration] = useAtom(durationTimeAtom);
  const jumpToPlay = (e) => {
    setHighlightAtom(null);
    const percentPoint = e.nativeEvent.offsetX / ref.current.offsetWidth;
    jump(percentPoint);
  };

  const videoTime = time
      .split(':')
      .map((x, index) => (index === 0 ? x * 60 : x))
      .reduce((a, b) => +a + +b);


  // const xablau = (json) => {
  //   const jsonStarTime = json.start
  //     .split(':')
  //     .map((x, index) => (index === 0 ? x * 60 : x))
  //     .reduce((a, b) => +a + +b);

  //   const videoDurtation = duration
  //     .split(':')
  //     .map((x, index) => (index === 0 ? x * 60 : x))
  //     .reduce((a, b) => +a + +b);

  //   const jsonFinalTime = json.final
  //     .split(':')
  //     .map((x, index) => (index === 0 ? x * 60 : x))
  //     .reduce((a, b) => +a + +b);

    
  //   const actualPercent = (jsonFinalTime * 100) / videoDurtation;
  //   const startPercent = (jsonStarTime * 100) / videoDurtation;

  //   console.log(duration);

  //   if (json.index === 0) return actualPercent;

  //   if (videoTime >= jsonStarTime) return actualPercent;

  //   return 0;
  // };

  return (
    <ProgressBarLine onClick={jumpToPlay} ref={ref}>
      {timelineColour.map((iten) => {
        const videoDurtation = duration
        .split(':')
        .map((x, index) => (index === 0 ? x * 60 : x))
        .reduce((a, b) => +a + +b);

        const {start, final} = iten;
        const startInSec = convertTime(start);
        const finalInSec = convertTime(final);
        const deregejhonson = convertTime(final) - convertTime(start);
        const length = ((deregejhonson || 1) * 100) / videoDurtation;
        
        return (
        // <ProgressBarFilled duration={videoDurtation} currentTime={videoTime} breakpointPercentage={5} color={iten.colour}></ProgressBarFilled>
        <ProgressBarFilled length={length} start={startInSec} end={finalInSec} currentTime={videoTime} color={iten.colour}></ProgressBarFilled>
      )})}
      {/* {[
        <ProgressBarFilled
          percent={ 50 }
          color={'red'}
        ></ProgressBarFilled>,
        <ProgressBarFilled
          percent={ 40 }
          color={'green'}
        ></ProgressBarFilled>,
        <ProgressBarFilled
          percent={ 10 }
          color={'blue'}
        ></ProgressBarFilled>, */}
      {/* ]} */}
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
  background-color: ${props => props.color};
  max-width:${props => props.length}%;
  transform-origin: left;
  flex-basis: 100%;
  transform: scale(${props => {
    const {length, start, currentTime, end} = props;
    const dinamicPercent = ((currentTime-start)/(end-start))*100 
    console.log(dinamicPercent)
    if (currentTime >= start) return dinamicPercent/100;
    return 0;
  }},1);
  z-index: 150;
  height: 10px;
`;

export default Control;
