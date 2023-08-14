import { useAtom } from 'jotai';
import React from 'react';
import { AiOutlineFileText } from 'react-icons/ai';
import { langchainQAAtom, showPDFAtom } from '../atom';

const NEGATIVE_ANSWERS = ["not related to the given context", "the given context does not provide", "there is no information in the given context", "but I don't have enough context to provide an answer to your question", "Apologies for the inconvenience!", " I apologize for the inconvenience!"]

const checkStringIncludes = (answer, strings) => {
  if (!answer) return false;
  return strings.some((str) => answer.includes(str));
}


const ChatArea = ({ width }) => {
  const [_, setShowPDF] = useAtom(showPDFAtom);
  const [langchainQA] = useAtom(langchainQAAtom);

  const hideSource = checkStringIncludes(langchainQA.answer, NEGATIVE_ANSWERS) || !langchainQA?.sourceDocs?.length
  
  return (
    <div
      className={`pdfview m-auto w-[${width
        }rem] overflow-auto h-full items-center flex justify-center relative`}
    >
      <div className={`h-[100vh] flex`}>
        <div className={` w-[90%] m-auto flex`}>
        
        <div className='bg-gray-500 rounded-md p-3'>
          <div className='bg-slate-300 rounded-md mb-3 px-8 py-4'>
            <div className='text-2xl font-extrabold mb-4'>Q. {langchainQA.question}</div>
            <div className='text-sm'>A. {langchainQA.answer}</div>
          </div>
          {hideSource ? null : (<div className='bg-slate-300 rounded-md px-8 py-4'>
            <div className='text-2xl font-extrabold mb-4'>Source</div>
            <div className='flex justify-center mt-2'>
              <div className='py-2 px-4 rounded bg-gray-500 text-white text-sm flex cursor-pointer' onClick={() => setShowPDF(true)}>
                <AiOutlineFileText className='text-xl mr-1' />
                Paper Source
              </div>
            </div>
          </div>)}
        </div>
      </div>
      </div>
    </div>
  )
}

export default ChatArea;