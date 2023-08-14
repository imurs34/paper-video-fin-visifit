import { useAtom } from 'jotai';
import React, { useRef, useState } from 'react';
import { currentSlideContextAtom, langchainQAAtom } from '../atom';

const VISUAL_QUESTION = "Describe it"

const Tooltip = ({ children, noContext }) => {
  const [langchainQA, setLangchainQA] = useAtom(langchainQAAtom);
  const [currentSlideContext] = useAtom(currentSlideContextAtom);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const [grayArea, enableGrayArea] = useState(false);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);

  const handleOpenTooltip = (event) => {
    const { clientX, clientY } = event;
    setTimeout(() => {
      setPosition({ top: clientY + 11, left: clientX });
      setIsOpen(true);
    });
  };

  const handleCloseTooltip = () => {
    setIsOpen(false);
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleWindowClick = () => {
    setQuery('');
    handleCloseTooltip();
    setError('');
  };

  const handleContentClick = (event) => {
    event.stopPropagation();
  };

  async function handleSubmit(e) {
    e?.preventDefault();

    setError(null);

    if (!query) {
      alert("Please input a question");
      return;
    }

    const question = query.trim();

    setLoading(true);
    enableGrayArea(true);
    setQuery("");

    try {
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          history: langchainQA.history || [],
          context: noContext ? "" : currentSlideContext,
        }),
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setLangchainQA({
          question,
          answer: data.text,
          sourceDocs: data.sourceDocuments,
          history: [...(langchainQA.history || []), [question, data.text]]
        });
        handleWindowClick();
      }

      setLoading(false);

      //scroll to bottom
      // messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError("An error occurred while fetching the data. Please try again.");
      console.log("error", error);
    }
    finally {
      enableGrayArea(false);
    }
  }

  //prevent empty submissions
  const handleEnter = (e) => {
    if (e.key === "Enter" && query) {
      handleSubmit(e);
    } else if (e.key == "Enter") {
      e.preventDefault();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      window.addEventListener('click', handleWindowClick);
      if (inputRef?.current) inputRef.current.focus();
    } else {
      window.removeEventListener('click', handleWindowClick);
    }

    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, [isOpen]);

  return (
    <div className='relative inline-block'>
      <div onClick={handleOpenTooltip}>{children}</div>
      {isOpen && (
        <>
          <div
            className='fixed z-50 p-4 bg-gray-500 text-white rounded-md shadow'
            style={{ top: position.top, left: position.left }}
            onClick={handleContentClick}
          >
            {grayArea && <div className='fixed top-0 left-0 w-screen h-screen opacity-70 bg-gray-500' style={{ zIndex: 999 }} />}
            <div className='tooltip-arrow'></div>
            <div className='flex items-center'>
              <div className='mr-2 bg-white text-gray-500 rounded-full py-2 px-3'>
                ?
              </div>
              <input
                ref={inputRef}
                disabled={loading}
                onKeyDown={handleEnter}
                type='text'
                value={query}
                placeholder={
                  loading
                    ? "Waiting for response..."
                    : "Ask Query?"
                }
                onChange={handleInputChange}
                className='w-full px-2 py-1 border border-gray-300 text-black rounded bg-white'
              />
            </div>
            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Tooltip;
