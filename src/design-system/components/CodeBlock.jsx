import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiClipboard } from 'react-icons/fi';
import beautify from 'js-beautify';
import { useState } from 'react';

/**
 * @typedef {Object} SyntaxHiglightedParams
 * @property {string} language
 * @property {string} children
 * @property {boolean} copyToClipboard
 */

/**
 * Syntax Highlight Block
 * @param {SyntaxHiglightedParams & import('react-syntax-highlighter').SyntaxHighlighterProps} param0
 * @link https://github.com/react-syntax-highlighter/react-syntax-highlighter?tab=readme-ov-file
 * @returns
 */
const SyntaxHighlightedContent = ({ language, copyToClipboard, children, ...props }) => {
  const [active, setActive] = useState(false);
  const [delayDuration, _setDelayDuration] = useState(3000);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setActive(true);
    // Use setTimeout to simulate a delayed action
    setTimeout(() => {
      setActive(false);
    }, delayDuration);
  };

  switch (language) {
    case 'javascript':
      children = beautify.js(children);
      break;

    case 'html':
      children = beautify.html(children);
      break;

    case 'css':
      children = beautify.css(children);
      break;
  }

  return (
    <div className="relative w-full h-auto">
      <SyntaxHighlighter
        language={language}
        style={materialDark}
        customStyle={{ margin: '0', fontSize: '0.8em' }}
        {...props}
      >
        {children}
      </SyntaxHighlighter>
      {copyToClipboard && (
        <div className="absolute top-2 right-2 flex flex-row gap-1 justify-center">
          {active && <span className="font-bold text-white-100">Copied to Clipboard</span>}
          <FiClipboard className="text-white-100" onClick={handleCopy} />
        </div>
      )}
    </div>
  );
};

export default SyntaxHighlightedContent;
