import _ from 'lodash';
import styled from 'styled-components';
import React, { useCallback, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import Tesseract from 'tesseract.js';

import { currentSlideContextAtom, darkModeAtom, highlightAtom, paragraphAtom, langchainQAAtom } from '../atom';
import pdfmap2 from '../pdfmap2.json';
import transcription from '../transcription.json';
import visualMap from '../visualMap.json';
import useOnClickOutside from '../hooks/onClickOutside';

function Image({ obj, fullData, url, width, widthRatio, heightRatio }) {
  const [fixed] = useState();
  const [dark] = useAtom(darkModeAtom);
  const [highlight, setHighlightAtom] = useAtom(highlightAtom);
  const [paragraph, setParagraphAtom] = useAtom(paragraphAtom);
  const [langchainQA, setLangchainQA] = useAtom(langchainQAAtom);
  const [, setCurrentSlideContextAtom] = useAtom(currentSlideContextAtom);
  const imgRef = useRef(null);

  const convertTimeIntoNumber = (time) => {
    const splittedTime = time?.split(":") || [];
    const numberTime = splittedTime.length ? Number(splittedTime[0]) * 60 + Number(splittedTime[1]) : 0;
    return numberTime;
  }

  const getTranscriptString = () => {
    let str = '';
    transcription.forEach(transcript => {
      const time = convertTimeIntoNumber(transcript?.start);

      if (time > fullData.start_time && time < fullData.end_time)
        str = `${str} ${transcript.text}`;
    });
    return str.trim();
  }

  const onClick = (e) => {
    let str = "";
    const targetId = e.target.id;

    pdfmap2.map((item) => {
      if (Number(item.slide_id) == obj.slide_id) {
        setParagraphAtom(item);
      }
    });

    const newTargetId = targetId?.split('/qabusidoc/')?.[1] || "";
    let imageDescription = '';

    if (newTargetId)
      imageDescription = visualMap.visual_mappings?.find(vi => newTargetId === vi.image_path)?.caption || '';

    setHighlightAtom(targetId);

    if (imageDescription) {
      setCurrentSlideContextAtom(imageDescription);
      setLangchainQA({
        ...langchainQA,
        history: []
      })
    } else {
      Tesseract.recognize(
        targetId,
        'eng',
      ).then(({ data: { text } }) => {
        str = text.replace(/\n/g, ' ');
        str = str.replace(/(?:(?:^|(\s))e\s)/g, "$1");
        const transcript = getTranscriptString();
        setCurrentSlideContextAtom(`${str} ${transcript}` || "");
      }).catch(e => console.log('==============e==============', e))
    }
  };
  useOnClickOutside(imgRef, () => setHighlightAtom(null));

  return (
    <Img
      fixed={fixed}
      ref={imgRef}
      onClick={onClick}
      isDark={dark}
      src={url}
      id={url}
      highlight={highlight}
    />
  );
}

function FixedImage({ url }) {
  const [dark] = useAtom(darkModeAtom);
  return (
    <FixedContainer isDark={dark}>
      <Img src={url} />
    </FixedContainer>
  );
}
const FixedContainer = styled.div`
  display: flex;
  flex: 1;
  flex-basis: 0;
  overflow: hidden;
`;
const Container = styled.div`
  display: flex;
  flex: 1;
  flex-basis: 0;
  overflow: hidden;
  visibility: ${(props) => (props.fixed ? 'hidden' : 'visible')};
  padding: 5px 0px;
  margin: 0 auto;
  width: 0;
  
};
`;
const Img = styled.img`
  margin: 0;
  max-width: 100%;
  max-height: 100%;
  filter: ${(props) =>
    props.src === props.highlight ? `grayscale(10%) invert(30%) saturate(200%)` : 'none'};
`;

export default React.memo(Image);
export { FixedImage };
