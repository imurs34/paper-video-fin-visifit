import { useAtom } from 'jotai';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { currentTimeAtom, darkModeAtom, mobileModeAtom, highlightAtom, percentAtom, durationTimeAtom, playingAtom,
  withFrameAtom, withVideoAtom, durationAtom } from '../atom';
import objeto from '../constants/map2ColourBlock';
import { paragraph, sections } from '../constants/transcriptBlock';
import { AiOutlineFullscreenExit, AiOutlineFullscreen } from 'react-icons/ai';
import { toggleZoom } from '../redux/reducers/zoomReducer';

const Subtitles = ({ subtitles, jump }) => {
  const [currentTime] = useAtom(currentTimeAtom);
  const [duration] = useAtom(durationAtom);
  const [focusedId, setFocusedId] = useState(null);
  const refs = useRef({});
  const [, setHighlightAtom] = useAtom(highlightAtom);
  const findSub = (time) => subtitles.find((element) => element.start == time) || null;

  const convertTime = (time) => {
    let string = time;
    const timeSplit = string.split(':');
    const minutes = parseInt(timeSplit[0]);
    const seconds = parseInt(timeSplit[1]);
    return minutes * 60 + seconds;
  };

  const jumpToTime = (time) => {
    let durationSeconds = duration;
    let focusTimeSeconds = convertTime(time);
    setHighlightAtom(null);
    const percentPoint = focusTimeSeconds / durationSeconds;
    jump(percentPoint);
  };

  useEffect(() => {
    const sub = findSub(currentTime);
    if (sub) setFocusedId(sub.index);
  }, [currentTime]);

  useEffect(() => {
    if (focusedId) refs.current[focusedId].focus();
  }, [focusedId]);

  const topRef = refs.current[1]?.getBoundingClientRect().top;
  const bottomRef = refs.current[6]?.getBoundingClientRect().bottom;

  const { map1: map1Toggle, map2: map2Toggle } = useSelector((state) => state.toggle);

  const dispatch = useDispatch();

  const zoomOpen = useSelector((state) => state.zoom.zoomOpen);

  const handleZoom = () => {
    dispatch(toggleZoom());
    const tste = document.querySelector('#videoContainer');
    tste.style.display = zoomOpen ? 'flex' : 'none';
  };

  return (
    <div className="flex flex-col w-full h-full z-40 overflow-y-auto relative">
      <div className="absolute top-1 right-5 p-4 border-purple-500 ">
        {zoomOpen ? (
          <AiOutlineFullscreenExit
            className="fixed text-white text-2xl z-50 cursor-pointer bg-indigo-800 rounded"
            onClick={handleZoom}
          />
        ) : (
          <AiOutlineFullscreen
            className="fixed text-white text-2xl z-50 cursor-pointer bg-indigo-800 rounded"
            onClick={handleZoom}
          />
        )}
      </div>
      {subtitles?.map((sub, index) => {
        return (
          <div
            className={`flex flex-row relative  ${sub.index === focusedId ? 'bg-indigo-600' : ''}`}
            key={sub.index}
            ref={(ref) => {
              refs.current[sub.index] = ref;
            }}
            tabIndex={focusedId === sub.index ? 0 : -1}
          >
            <div className="w-[20%] flex items-center">
              <button className="p-1 flex items-center h-6 text-white text-sm bg-gray-500 rounded-full" onClick={() => jumpToTime(sub.start)}>
                {sub.start}
              </button>
              {/* Sessions */}
              {map1Toggle &&
                sections.map(
                  ({ initial, final, color }, index) =>
                    sub.index >= initial &&
                    sub.index <= final && (
                      <div className={`w-4 h-full mr-2`} style={{ background: color }} />
                    ),
                )}

              {/* Paragraphs */}
              {map2Toggle &&
                paragraph.map(
                  ({ initial, final, color }, index) =>
                    sub.index >= initial &&
                    sub.index <= final && (
                      <div className={`w-4 h-full mr-2`} style={{ background: color }} />
                    ),
                )}
            </div>
            <h1 className="w-[100%] py-3 text-white text-xl" onClick={() => jumpToTime(sub.start)} style={{cursor: "pointer"}}>{sub.text}</h1>
          </div>
        );
      })}
    </div>
  );
};

export default Subtitles;
