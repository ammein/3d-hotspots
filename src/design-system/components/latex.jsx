import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const renderBlock = (latex, container, displayMode = true) => {
  try {
    katex.render(latex, container, {
      throwOnError: false,
      displayMode,
    });
  } catch (err) {
    container.innerHTML = `<span style="color:red;">${err.message}</span>`;
  }
};

/**
 * Latex Renderer
 * @param {{ as: string, latex: string, displayMode: boolean }} param0
 * @link https://latexeditor.lagrida.com/
 * @returns
 */
const LatexRenderer = ({ as = 'div', latex, displayMode = true }) => {
  const containerRef = useRef();

  const Tag = as;

  useEffect(() => {
    if (containerRef.current && latex) {
      const blocks = latex
        .split(/\n\s*\n/) // split on empty lines (paragraph breaks)
        .map((b) => b.trim())
        .filter((b) => b);

      containerRef.current.innerHTML = ''; // clear previous

      blocks.forEach((block) => {
        const el = document.createElement(Tag);
        containerRef.current.appendChild(el);

        const isMathBlock =
          block.startsWith('\\[') ||
          block.startsWith('\\(') ||
          block.startsWith('\\begin') ||
          block.includes('&=') ||
          block.includes('^') ||
          displayMode;

        const cleanBlock = block.replace(/^\\\[|\\\]$/g, '');
        renderBlock(cleanBlock, el, isMathBlock);
      });
    }
  }, [latex, displayMode, Tag]);

  return (
    <Tag
      ref={containerRef}
      style={
        displayMode
          ? {
              backgroundColor: '#e3e3e3',
              padding: '20px 0 20px 0',
            }
          : undefined
      }
    />
  );
};

export { LatexRenderer };
