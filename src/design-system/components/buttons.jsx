import styled, { css } from 'styled-components';
import tw from 'tailwind-styled-components';

/**
 * @typedef {{
 * $size: "large" | "regular" | "small";
 * $icon: boolean;
 * $buttonType: "scream" | "shout" | "cheer" | "murmur" | "circle";
 * $greyButton: boolean;
 * $weight: "regular" | "italic" | "semibold" | "semibold-italic" | "bold" | "bold-italic";
 * $other: string
 * }} Button
 */

/**
 * --- The Button Component ---
 * A flexible button built with tailwind-styled-components.
 *
 * Props are prefixed with '$' to prevent them from being passed to the
 * underlying DOM element, which is the standard convention for this library.
 * @type {import('tailwind-styled-components/dist/tailwind').TailwindComponent<'web', Button & React.HTMLAttributes<HTMLButtonElement>>}
 */
export const Button = tw.button`
    inline-flex
    items-center
    justify-center
    border-none
    ${(props) => !props.disabled && 'cursor-pointer'}
    transition-colors
    font-sans
    ${(props) => props.$other}

    ${({ $buttonType = 'scream', $greyButton = false, disabled = false }) => {
      // --- Button Type, Style, and Hover States ---
      switch ($buttonType) {
        case 'scream':
          return $greyButton
            ? `
              bg-white-100
              rounded-full
              outline
              outline-1
              outline-[var(--black-64)]
              outline-offset-[-0.5px]
              text-black-64
            `
            : `
              text-white-100
              bg-[#0870D3]
              rounded-[28px]

              dark:bg-white-100
              dark:text-[#075CAD]
            ` +
                (!disabled &&
                  `
                hover:text-[#075CAD]
                hover:bg-white-100
                hover:outline
                hover:outline-2
                hover:outline-[#075CAD]
                hover:outline-offset-[-2px]
                dark:hover:bg-[#075CAD]
                dark:hover:text-white-100
                dark:hover:outline-white-100
              `);
        case 'shout':
          return $greyButton
            ? `
              bg-transparent
              rounded-full
              outline
              outline-2
              !outline-black-64
              outline-offset-[-2px]
              text-black-64
            `
            : `
              bg-transparent
              text-[#0870D3]
              outline
              outline-2
              outline-[#0870D3]
              outline-offset-[-2px]
              rounded-[28px]
              dark:text-white-100
              dark:outline-white-100
            ` +
                (!disabled &&
                  `
                hover:text-white-100
                hover:bg-[#075CAD]
                dark:hover:text-[#075CAD]
                dark:hover:bg-white-100
              `);
        case 'cheer':
          return `
            bg-transparent
            text-[#0870D3]
            p-0
            gap-2
            dark:text-white-100
            [&>svg]:rounded-full
            [&>svg]:p-1
            [&>svg]:w-4
            [&>svg]:h-4
            [&>svg]:border-2
            [&>svg]:border-[#0870D3]
          `;
        case 'murmur':
          return `
            bg-transparent
            text-[#0870D3]
            p-0
            gap-2
            dark:text-white-100
            [&>svg]:w-4
            [&>svg]:h-4
          `;
        case 'circle':
          return `
            bg-white-100
            shadow-[0px_16px_16px_rgba(0,0,0,0.32)]
            rounded-full
          `;
        default:
          return '';
      }
    }}

    ${({ $buttonType = 'scream', $size = 'regular', $icon = false }) => {
      // --- Sizing Logic based on Type and Icon ---
      if ($buttonType === 'circle') {
        return $size === 'large' || $size === 'regular'
          ? 'p-6 min-w-16 min-h-16'
          : 'p-3 min-w-10 min-h-10';
      }

      if ($buttonType === 'scream' || $buttonType === 'shout') {
        if ($icon) {
          return (
            {
              large: 'py-[14px] pl-6 pr-7 gap-2',
              regular: 'py-3 pl-4 pr-5 gap-2',
              small: 'py-2 px-3 gap-1',
            }[$size] || ''
          );
        } else {
          return `gap-2.5 justify-start items-start ${
            {
              large: 'px-10 py-[14px]',
              regular: 'px-6 py-3',
              small: 'px-4 py-[9.5px]',
            }[$size] || ''
          }`;
        }
      }
      return '';
    }}

    ${({ $weight = 'regular' }) =>
      ({
        regular: '!font-normal',
        italic: '!font-normal italic',
        semibold: '!font-semibold',
        'semibold-italic': '!font-semibold italic',
        bold: '!font-bold',
        '!bold-italic': '!font-bold italic',
      }[$weight])}


    ${({ $size = 'regular' }) =>
      ({
        large: '!text-[18px] !leading-[18px]',
        regular: '!text-base !leading-4',
        small: '!text-[13px] !leading-[13px]',
      }[$size])}
`;
