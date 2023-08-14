import React, { useState, useEffect, useRef } from 'react';
import Base from '../components/base';
import input from '../input1.json';
import subtitles from '../transcription.json';
import PdfView2 from '../components/PdfView2';
import Split from 'react-split';
import Togglebtn from '../components/Togglebtn';
import ChatArea from '../components/ChatArea';
import { useAtom } from 'jotai';
import { langchainQAAtom, showPDFAtom } from '../atom';

const Index = () => {
  const [paragraphs, setParagraphs] = useState();
  const videoComponentRef = useRef();

  const [langchainQA] = useAtom(langchainQAAtom);
  const [showPDF, setShowPDF] = useAtom(showPDFAtom);

  React.useEffect(() => {
    setShowPDF(!langchainQA.question || !langchainQA.answer)
  }, [langchainQA]);

  React.useEffect(() => {
    console.log("MY REF", videoComponentRef.current);
  }, []);

  const sizes = [60, 40];
  const [width, setWidth] = useState([sizes[0], sizes[1]]);


  const currentParagraphs = (val) => {
    setParagraphs(val);
  };

  const handleDrag = (sizes) => {
    setWidth(sizes);
  };

  useEffect(() => {
    if (document.querySelectorAll('.gutter')?.[1]?.style)
      document.querySelectorAll('.gutter')[1].style.display = 'none';
  }, []);

  return (
    <Split
      gutterSize={20}
      onDragEnd={handleDrag}
      className="flex w-screen h-screen relative "
      sizes={[sizes[0], sizes[1]]}
    >
      <div>
        <Base
          transcription={subtitles}
          input={input}
          paragraphs={currentParagraphs}
          width={width[0]}
        />
      </div>
      {/* TODO: need to change with actual condition when paper will be integrated */}
      {showPDF ? (
        <>
          <div className="overflow-auto">
            <PdfView2 paragraphs={paragraphs} width={width[1]} input={input} />
          </div>
          <div>
            <Togglebtn />
          </div>
        </>
      ) : (
        // These fragments are important for resizing do not remove it.
        <>
          <div className="overflow-auto">
            <ChatArea width={width[1]} />
          </div>
        </>
      )}
    </Split >
  );
};

export default Index;
