import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleMap1, toggleMap2 } from '../redux/reducers/toggleReducer';
import ReactSwitch from 'react-switch';
import { useAtom } from 'jotai';
import { langchainQAAtom, showPDFAtom } from '../atom';

const Togglebtn = () => {
  const dispatch = useDispatch();
  const [_, setShowPDF] = useAtom(showPDFAtom);
  const [langchainQA] = useAtom(langchainQAAtom);

  const [map1Checked, setMap1Checked] = useState(false);
  const [map2Checked, setMap2Checked] = useState(false);

  const handleMap1Click = (state, func, setState) => {
    if (state) {
      setState(false);
      dispatch(func());
    } else {
      setState(true);
      dispatch(func());
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4 text-white items-center font-bold">
      <div className='flex gap-2 justify-center items-center'>
        <label>MAP1</label>
        <ReactSwitch
          onChange={() => handleMap1Click(map1Checked, toggleMap1, setMap1Checked)}
          checked={map1Checked}
          checkedIcon={false}
          uncheckedIcon={false}
          onColor="#338fff"
          offColor="#000"
        />
      </div>

      <div className='flex gap-2 justify-center items-center'>
        <label>MAP2</label>
        <ReactSwitch
          onChange={() => handleMap1Click(map2Checked, toggleMap2, setMap2Checked)}
          checked={map2Checked}
          checkedIcon={false}
          uncheckedIcon={false}
          onColor="#338fff"
          offColor="#000"
        />
      </div>

      {langchainQA.question ? <div className='flex gap-2 justify-center items-center'>
        <label>Chat</label>
        <ReactSwitch
          onChange={() => setShowPDF(false)}
          checked={false}
          checkedIcon={false}
          uncheckedIcon={false}
          onColor="#338fff"
          offColor="#000"
        />
      </div> : null}
    </div>
  );
};

export default Togglebtn;
