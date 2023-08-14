import React, { useState, useEffect } from 'react';
import pdfmap from '../pdfmap1.json';
import { useAtom } from 'jotai';
import { useSelector } from 'react-redux';
import { paragraphAtom, activityAtom, durationAtom, percentAtom, playingAtom, highlightAtom, langchainQAAtom } from '../atom';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { highlightPlugin, Trigger } from '@react-pdf-viewer/highlight';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import pdfmap2 from '../pdfmap2.json';
import map1PdfBars from '../map1PdfBars.json';
import pdf2copy from '../map2PdfBars.json';
import blockColours from '../constants/map2ColourBlock';
import sectionBlock from '../constants/map1ColourBlock';

function PdfView2({ width, input }) {
  const [paragraphs, setParagraphAtom] = useAtom(paragraphAtom);
  const [current] = useAtom(activityAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const [percent, setPercent] = useAtom(percentAtom);
  const [play, setPlay] = useAtom(playingAtom);
  const [activity, setActivity] = useAtom(activityAtom);
  const [, setHighlightAtom] = useAtom(highlightAtom);
  const [langchainQA] = useAtom(langchainQAAtom);

  const [paragraphsState, setLocalParagraph] = useState({});

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs: () => [],
  });

  const [areas, setAreas] = React.useState([]);
  const [ref, setRef] = useState(null);
  const [videoRef, setVideoRef] = useState();
  const [content, setContent] = useState(input.content.original);

  const map1Toggle = useSelector((state) => state.toggle.map1);
  const map2Toggle = useSelector((state) => state.toggle.map2);

  const convertTime = (time) => {
    let string = time;
    const timeSplit = string.split(':');
    const minutes = parseInt(timeSplit[0]);
    const seconds = parseInt(timeSplit[1]);
    return minutes * 60 + seconds;
  };

  useEffect(() => {
    let videoContainer = document.getElementsByTagName("video"); //document.getElementById('innerCon');
    if (videoContainer != null) {
      setVideoRef(videoContainer[0]); //document.getElementById('innerCon');
      // console.log("VIDEO", videoRef)
    }
  }, []);

  const jump = (percentPoint) => {
    const time = percentPoint * duration;
    setPercent(percentPoint);
    videoRef.currentTime = time;
    // videoRef.current.play();
    setTimeout(() => {
      if (!play) {
        videoRef.pause();
        setPlay(false);
      }
    }, 100);
    const slide = _.findLastIndex(content, (obj) => obj.start_time < time);
    const action = "jump";
    setActivity({ slide, action, time, play });
  }

  const jumpToTime = (time) => {
    let durationSeconds = duration //509; //convertTime(duration);
    let focusTimeSeconds = convertTime(time);
    setHighlightAtom(null);
    const percentPoint = focusTimeSeconds / durationSeconds;
    jump(percentPoint);
  };

  const getParagraphValue = (paraObj) => {
    const paragraph = [];
    let paragraphDetails = {};
    pdfmap2.find((item) => {
      item.paragraph.forEach((paraId) => {
        if (paraId === paraObj.id) {
          paragraph.push(paraId)
        }
      });
      if (paragraph.length) {
        paragraphDetails = item;
        return true;
      }
      return false
    });
    return { paragraph, paragraphDetails };
  }

  const getHighlights = (pageContent) => {
    let content = pageContent.replace(/\n\s*,\s*/g, ', ');
    content = content.replace(/\n/g, '');

    const highlights = [];
    const paragraphArray = [];
    let __paragraphDetails = {};
    pdfmap.forEach((item) => {
      const para = item?.paragraphs || "";

      if (para.length) {
        const cond = para.startsWith(content) || para.includes(content.substring(0, 10)) || content.includes(para.substring(0, 10));
        if (cond) {
          highlights.push({ ...item?.highlights[0], pageIndex: item.pageIndex - 1 });
          const { paragraph, paragraphDetails } = getParagraphValue(item);
          paragraphArray.push(...paragraph);
          if (Object.keys(paragraphDetails).length)
            __paragraphDetails = paragraphDetails;
        }
      }
    })
    if (paragraphArray.length) {
      __paragraphDetails = {
        ...__paragraphDetails,
        paragraph: paragraphArray
      };
    }
    return { highlights, __paragraphDetails };
  }


  useEffect(() => {
    try {
      const source = langchainQA.sourceDocs?.[0];
      setLocalParagraph(paragraphs || {})
      if (source?.pageContent) {
        const { highlights, __paragraphDetails } = getHighlights(source.pageContent);
        setAreas(highlights);
        setLocalParagraph(JSON.parse(JSON.stringify(__paragraphDetails)));
        setTimeout(() => {
          jumpToPage(source.metadata?.['loc.pageNumber'] - 1)
        }, 500);
      } else if (paragraphs) {
        let array = [];
        pdfmap.forEach((item) => {
          if (paragraphs.paragraph.find((element) => element === item.id)) {
            if (paragraphs?.paragraph[0] && Number(item.id) == paragraphs?.paragraph[0]) {
              jumpToPage(item.pageIndex - 1);
            }
            if (item?.highlights && item.highlights.length > 0)
              array.push({ ...item?.highlights[0], pageIndex: item.pageIndex - 1 });
          }
        });
        setAreas(array);
      }
    } catch (error) {
      console.log('error  ', error.message);
    }
  }, [paragraphs]);

  useEffect(() => {
    const found = pdfmap2.find((item) => item.slide_id === current.slide);
    if (found) setParagraphAtom(found);
  }, [current]);

  const clicked = (index) => {
    pdfmap.map((item) => {
      if (Number(item.id) == paragraphsState.paragraph[index]) {
        jumpToPage(item.pageIndex - 1);
      }
    });
  };

  useEffect(() => {
    const el = document.getElementById('highlight-area');
    if (el) {
      // setTimeout(() => {
      //   el.scrollIntoView({
      //     block: 'center',
      //     // inline: "center",
      //   });
      // }, 500);
      // TODO: test if this commented code cause any issue in jumping to page
    }
  }, [ref]);

  const [getZoom, setZoom] = useState(1);

  const handleZoom = (e) => setZoom(e.scale);

  const pdfBlockBorderWitdh = 6 * getZoom;
  const sectionBars = 16 * getZoom;
  const paragraphBars = 8 * getZoom;

  const paragraphColour = (array, colour, props) =>
    pdf2copy
      .filter((item, index) => array.includes(item.id) && props.pageIndex === item.pageIndex - 1)
      .map((area, idx) => (
        <div
          style={Object.assign({}, props.getCssProperties(area.highlights[0], props.rotation), {
            [area.highlights[0].left > 50
              ? 'borderRight'
              : 'borderLeft']: `${pdfBlockBorderWitdh}px solid ${colour}`,
            [area.highlights[0].left > 50 && 'marginLeft']: `${paragraphBars}px`, zIndex: '1', cursor: 'pointer',
            [area.highlights[0].left < 50 && 'marginLeft']: `-${paragraphBars}px`,
          })}
          onClick={() => jumpToTime(area.start)} />
      ));

  const sectionColour = (array, colour, props) =>
    map1PdfBars
      .filter((item, index) => array.includes(item.id) && props.pageIndex === item.pageIndex - 1)
      .map((area, idx) => (
        <div
          key={idx}
          style={Object.assign({}, props.getCssProperties(area.highlights[0], props.rotation), {
            [area.highlights[0].left > 50
              ? 'borderRight'
              : 'borderLeft']: `${pdfBlockBorderWitdh}px solid ${colour}`, zIndex: '1', cursor: 'grab',
            [area.highlights[0].left > 50 && 'marginLeft']: `${sectionBars}px`,
            [area.highlights[0].left < 50 && 'marginLeft']: `-${sectionBars}px`,
          })}
          onClick={() => jumpToTime(area.start)} />
      ));

  const highlightColour = (array, colour, props) =>
    pdfmap
      .filter((item, index) => array.includes(item.id) && props.pageIndex === item.pageIndex - 1)
      .map((area, idx) => (
        <div
          key={idx}
          style={Object.assign(
            {},
            {
              background: colour,
              opacity: 0.18,
              mixBlendMode: 'multiply',
            },
            props.getCssProperties(area.highlights[0], props.rotation),
          )}
        />
      ));

  const renderHighlights = (props) => (
    <div>
      {areas
        .filter((area) => area.pageIndex === props.pageIndex)
        .map((area, idx) => (
          <div style={{ display: 'flex' }} key={idx}>
            <div
              className="highlight-area z-10"
              id="highlight-area"
              ref={(ref) => setRef(ref)}
              style={Object.assign(
                {},
                {
                  background: 'yellow',
                  opacity: 0.18,
                  mixBlendMode: 'multiply',
                },
                props.getCssProperties(area, props.rotation),
              )}
            />
          </div>
        ))}

      {/* MAP1 */}
      {map1Toggle &&
        sectionBlock.map((item, index) => sectionColour(item.jsonIndex, item.colour, props))}

      {/* MAP2 */}
      {map2Toggle && (
        <>
          {blockColours.map((item, index) => paragraphColour(item.paragraph, item.colour, props))}
        </>
      )}
    </div>
  );

  const highlightPluginInstance = highlightPlugin({
    renderHighlights,
    trigger: Trigger.None,
  });

  return (
    <div
      className={`pdfview m-auto w-[${width - 20
        }rem] overflow-auto h-full items-center flex justify-center relative`}
    >
      <div className={` w-full h-[100vh]  overflow-auto  flex-col `}>
        <div className={` w-[90%] m-auto  h-[90vh]  overflow-auto  flex-col `}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.1.81/build/pdf.worker.js">
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center',
              }}
            ></div>
            <Viewer
              fileUrl="/pdfs/visifit.pdf"
              defaultScale={SpecialZoomLevel.PageFit}
              onZoom={handleZoom}
              plugins={[
                highlightPluginInstance,
                pageNavigationPluginInstance,
                defaultLayoutPluginInstance,
              ]}
            />
          </Worker>
        </div>
        <div className={`flex flex-col text-white ml-12  mt-2 text-sm `}>
          {(() => {
            if (paragraphsState) {
              if (paragraphsState.sections) {
                let sections = paragraphsState.sections.replace(/'/g, '"'); //replacing all ' with "
                let scores = paragraphsState.scores;
                sections = JSON.parse(sections);

                let buttons = [];
                for (let i = 0; i < paragraphsState?.paragraph.length; i++) {
                  let para = '';
                  pdfmap.map((item) => {
                    if (Number(item.id) == paragraphsState.paragraph[i]) {
                      para = item.paragraphs.split(' ').slice(0, 7).join(' ');
                    }
                  });

                  buttons.push(
                    <div className="flex items-center my-1" key={i}>
                      <div
                        onClick={() => clicked(i)}
                        type="button"
                        className={`${scores[i] < 0.7 ? 'bg-yellow-500' : 'bg-rose-800'
                          } text-white w-44  py-3  cursor-pointer rounded-lg text-center font-extrabold font-sans mr-3`}
                      >
                        {sections[i]}
                      </div>
                      <span>{para}...</span>
                    </div>,
                  );
                }

                return buttons;
              }
            }
          })()}
        </div>
      </div>
    </div>
  );
}

export default PdfView2;

const renderToolbar = (Toolbar) => (
  <Toolbar>
    {(slots) => {
      const { CurrentPageInput, CurrentScale, GoToNextPage, GoToPreviousPage, ZoomIn, ZoomOut } =
        slots;
      return (
        <div className="flex justify-center w-full">
          <div>
            <GoToPreviousPage />
          </div>
          <div className="w-11">
            <CurrentPageInput />
          </div>
          <div>
            <GoToNextPage />
          </div>
          <div className="flex items-center border-l border-solid border-white ml-2">
            <ZoomOut />
            <CurrentScale />
            <ZoomIn />
          </div>
        </div>
      );
    }}
  </Toolbar>
);
