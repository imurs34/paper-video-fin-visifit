import _ from 'lodash';
import React from 'react';
import Head from 'next/head';
import shortid from 'shortid';
import { useAtom } from 'jotai';
import { useSelector } from 'react-redux';
import { createBreakpoint } from 'react-use';
import styled, { css } from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import useWindowOrientation from 'use-window-orientation';

import Tooltip from './QuestionTooltip';
import Controller from './Controller';
import Content from './Content';
import Video from './Video';
import {
  darkModeAtom,
  durationAtom,
  frameHeightAtom,
  mobileModeAtom,
  withVideoAtom,
} from '../atom';
import Subtitles from './Subtitles';
import timelineColour from '../timelineColour.json';

const useBreakpoint = createBreakpoint({ XL: 1280, L: 768, S: 350 });

const convertTime = (time) => {
  const timeSplit = time.split(':');
  const minutes = parseInt(timeSplit[0]);
  const seconds = parseInt(timeSplit[1]);
  return minutes * 60 + seconds;
};

// const positionSegmentation = (start, duration, index) => {
//   const startPercent = (convertTime(start) / duration) * 100;
//   // const endPercent = (convertTime(end) / duration) * 100;
//   return 0;
// };

const ControllerLine = ({ content }) => {
  const [duration] = useAtom(durationAtom);
  const [show, setShow] = useState(false);

  const startTimes = _.map(content, 'end_time');
  if (!duration) {
    return (
      <Loading key={shortid.generate()}>
        <p>loading...</p>
      </Loading>
    );
  }

  const onHoverDiv = (e) => {
    console.log('ola');
  };



  return (
    <Line className='line'>
      {timelineColour.map((time, index, array) => {
        const previousStartTimesSum =
          index === 0
            ? 0
            : array.slice(0, index).reduce((sum, t) => {
              return sum + convertTime(t.start);
            }, 0);
        const start = (convertTime(time.start) * 100) / duration;
        const previousFinal = index === 0 ? 0 : convertTime(array[index - 1].final);
        const value = ((convertTime(time.final) - previousFinal) / duration) * 100;
        return (
          <LinePoint
            key={shortid.generate()}
            colour={time.colour}
            value={value}
            start={start}
            onMouseEnter={onHoverDiv}
            className="linePoint"
          >
            <Segmentation colour="transparent" />
          </LinePoint>
        );
      })}
    </Line>
  );
};
const Loading = styled.div`
  > p {
    color: white;
  }
  z-index: 200;
  background-color: black;
  position: fixed;
  min-width: 100%;
  min-height: 100%;
  display: ${(props) => (props.isLoading ? 'flex' : 'none')};
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const Segmentation = styled.div`
  width: 2px;
  height: 10px;
  position: absolute;
  left: 100%;
  /* border-radius: 45%; */
  background-color: ${(props) => props.colour};
`;

const LinePoint = styled.div`
  position: absolute;
  top: 0;
  left: ${(props) => props.start}%;
  margin-top: 5px;
  width: ${(props) => props.value}%;
  height: 10px;
  background-color: ${(props) => props.colour};
  opacity: 0.5;
`;

const Line = styled.div`
  margin-top: 5px;
  pointer-events: none;
  display: flex;
  width: 100%;
  height: 20px;
  position: absolute;
  overflow: hidden;
  top: 0;
`;

const modeSelector = ({ mobile, dark }) => {
  if (mobile && dark) return 'restructure_dark';
  if (mobile) return 'restructure';
  if (dark) return 'original_dark';
  return 'original';
};

const imageSelector = ({ location, dark }) => {
  const locationPrefix = location === 'top' ? 'top_img' : 'bottom_img';
  return dark ? `${locationPrefix}_dark` : locationPrefix;
};

const Base = ({ input, paragraphs, width, transcription }) => {
  useEffect(() => {
    let videoContainer = document.getElementById('videoContainer');
    if (videoContainer != null) {
      let videoContainer = document.getElementById('videoContainer');
      videoContainer.style.height = `${(videoContainer.clientWidth / input.template.width) * input.template.height + 60
        }px`;
    }
  }, [width]);
  const [dark] = useAtom(darkModeAtom);
  const [mobile] = useAtom(mobileModeAtom);
  const [height, setHeight] = useAtom(frameHeightAtom);
  const [content, setContent] = useState(input.content.original);
  useEffect(() => {
    reset();
    setContent(input.content[modeSelector({ mobile, dark })]);
  }, [dark, mobile]);
  useEffect(() => {
    setHeight(input.template.height);
  }, []);
  const [duration] = useAtom(durationAtom);

  const [key, setKey] = useState(shortid.generate());
  const reset = () => {
    setKey(() => shortid.generate());
    videoComponentRef.current.initial();
  };

  const [withVideo] = useAtom(withVideoAtom);

  const videoComponentRef = useRef();

  const togglePlay = () => {
    videoComponentRef.current.toggle();
  };

  const jump = (percentPoint) => {
    videoComponentRef.current.jump(percentPoint);
  };

  //const jumpToTime = (time) => {
  // setHighlightAtom(null);
  //const videoElement = ref.current;
  //videoComponentRef.current.currentTime = timeToSeconds(time);
  //};



  const videoSource = input.sourcePath + input.video.source;

  const frameInfo = {
    sourcePath: input.sourcePath,
    topBg: input.template[imageSelector({ location: 'top', dark })],
    bottomBg: input.template[imageSelector({ location: 'bottom', dark })],
    topHeight: (input.template.top_padding / input.template.height) * 100,
    bottomHeight: (input.template.bottom_padding / input.template.height) * 100,
  };

  const { portrait } = useWindowOrientation();
  const breakpoint = useBreakpoint();
  useEffect(() => {
    reset();
  }, [portrait]);

  const currentParagraphs = (val) => {
    paragraphs(val);
  };

  const zoomOpen = useSelector((state) => state.zoom.zoomOpen);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        {input.template.fontUrl.map((url, index) => {
          return <link href={url} key={index} rel="stylesheet" />;
        })}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta
          name="viewport"
          content="viewport-fit=cover, user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <div className={`flex flex-col justify-center items-center h-screen mx-8`}>
        <ButtonContainer>
          <Tooltip noContext>
            <div
              type="button"
              className={`bg-yellow-500 text-white py-4 px-4 cursor-pointer rounded-lg text-center font-extrabold font-sans mr-3`}
            >
              Ask General Question
            </div>
          </Tooltip>
        </ButtonContainer>
        <Container className={`node w-full h-[50%] items-center`} id="videoContainer" isDark={dark}>
          <Loading isLoading={!duration}>
            <p>loading..</p>
          </Loading>
          <InnerContainer
            isFull={!withVideo}
            disableControl={_.get(input, 'template.disableControl')}
          >
            <InnerContent key={key} id="innerCon">
              {content.map((data, index) => {
                return (
                  <Content
                    key={index}
                    data={data}
                    index={index}
                    width={width}
                    sourcePath={input.sourcePath}
                    frameInfo={frameInfo}
                    isFull={!withVideo}
                    template={input.template}
                    disableControl={_.get(input, 'template.disableControl')}
                    currentParagraphs={currentParagraphs}
                  />
                );
              })}
            </InnerContent>
            <Video
              className="ml-0"
              src={videoSource}
              content={content}
              ref={videoComponentRef}
              videoLocation={input.video.control}
              id="videoz"
            />
          </InnerContainer>
          <ControllerContainer>
            <Controller
              reset={reset}
              togglePlay={togglePlay}
              jump={jump}
              disableControl={_.get(input, 'template.disableControl')}
            />
            <ControllerLine content={content} />
          </ControllerContainer>
        </Container>
        {zoomOpen && (
          <div className={`h-[100%] w-full`}>
            <Subtitles subtitles={transcription} jump={jump}></Subtitles>
          </div>
        )}

        {!zoomOpen && (
          <div className={`h-[20%] w-full`}>
            <Subtitles subtitles={transcription} jump={jump}></Subtitles>
          </div> // checked
        )}
      </div>
    </>
  );
};


const Block = styled.div`
  color: white;
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: black;
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const ControllerContainer = styled.div`
  width: 100%;
  position: relative;
  background-color: black;
`;
const InnerContainer = styled.div.attrs({ className: 'frame' })`
  flex: 1;
  display: flex;
  align-items: stretch;
  position: relative;
  background-color: transparent;
  ${(props) =>
    props.isFull &&
    css`
      padding-right: 0;
    `};
  ${(props) =>
    props.disableControl &&
    css`
      padding-left: 100px;
      padding-right: 100px;
    `};
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  // height: 100vh;
  // max-height: 100vh;
  // width: 100vw;
  // max-width: 100vw;
  overflow: hidden;
  box-sizing: border-box;
  align-items: stretch;
  position: relative;
  background-color: ${(props) => (props.isDark ? `rgb(47, 48, 48)` : 'white')};
  @supports (-webkit-touch-callout: none) {
    height: -webkit-fill-available;
  }
`;

const InnerContent = styled.div`
  flex: 1;
  display: flex;
  align-items: stretch;
  position: relative;
`;

const ButtonContainer = styled.div`
width: 100%;
margin-bottom: 5px;
`;
export default Base;
