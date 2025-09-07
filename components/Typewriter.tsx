import React, { useState, useEffect, useRef, useMemo } from 'react';

interface TypewriterProps {
  fullText: string;
  isTyping: boolean;
  speed?: number;
  onFinished: () => void;
}

const parseText = (text: string) => {
    // Split by <<...>> and keep the delimiter
    const parts = text.split(/(<<.*?>>)/g);
    return parts.map((part, index) => {
        if (part.startsWith('<<') && part.endsWith('>>')) {
            return <em key={index} className="text-green-500 dark:text-green-400 not-italic font-bold">{part.slice(2, -2)}</em>;
        }
        return part;
    });
};


const Typewriter: React.FC<TypewriterProps> = ({ fullText, isTyping, speed = 30, onFinished }) => {
  const [displayedText, setDisplayedText] = useState('');
  const prevFullTextRef = useRef('');

  useEffect(() => {
    if (isTyping) {
      let startPos = 0;
      let initialText = '';

      // Check if the new text is an extension of the previously displayed text.
      // This handles cases where more dialogue is added to the same page.
      if (fullText.startsWith(prevFullTextRef.current)) {
        initialText = prevFullTextRef.current;
        startPos = prevFullTextRef.current.length;
      }
      
      setDisplayedText(initialText);

      // If the text is already complete, finish immediately.
      if (startPos >= fullText.length) {
          onFinished();
          return;
      }

      let i = startPos;
      const intervalId = setInterval(() => {
        i++;
        setDisplayedText(fullText.substring(0, i));
        if (i >= fullText.length) {
          clearInterval(intervalId);
          onFinished();
        }
      }, speed);

      return () => clearInterval(intervalId);
    } else {
      // If not typing (e.g., skipped), show the full text immediately.
      setDisplayedText(fullText);
    }
  }, [fullText, isTyping, speed, onFinished]);

  // Update the ref whenever the displayed text changes or typing finishes.
  useEffect(() => {
    if (!isTyping) {
      prevFullTextRef.current = fullText;
    }
  }, [isTyping, fullText]);

  const parsedContent = useMemo(() => parseText(displayedText), [displayedText]);

  return (
    <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap min-h-[1.5em]">{parsedContent}</p>
  );
};

export default React.memo(Typewriter);