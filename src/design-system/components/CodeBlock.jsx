import { useEffect, useMemo } from 'react';
import '@/assets/prismjs/prism';
import '@/assets/prismjs/prism.css';
import beautify from 'js-beautify';

// if you are intending to use Prism functions manually, you will need to set:
window.Prism.manual = true;

/**
 * @typedef {Object} PrismParams
 * @property {string} code
 * @property {boolean} showLineNumbers
 * @property {"javascript" | "glsl" | "html" | "css" | "jsx" | "diff" | "shell"} language
 * @property {string} line Line Range. Refer: https://prismjs.com/plugins/line-highlight/
 */

/**
 * Function Plot
 * @param {PrismParams} param0
 * @returns
 */
const CodeBlock = ({ code, showLineNumbers = true, language, line }) => {
  useEffect(() => {
    window.Prism.highlightAll(); // Highlights all code blocks on the page
  }, [code, language]); // Re-highlight if code or language changes

  const beautifyCode = useMemo(() => {
    switch (language) {
      case 'javascript':
        return beautify.js(code);

      case 'html':
        return beautify.html(code);

      case 'css':
        return beautify.js(code);

      default:
        return code;
    }
  }, [code, language]);

  return (
    <pre>
      <code
        className={`language-${language} ${showLineNumbers ? 'line-numbers' : ''}`}
        data-line={line ? line : undefined}
      >
        {beautifyCode}
      </code>
    </pre>
  );
};

export default CodeBlock;
