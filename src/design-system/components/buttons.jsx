import styled, { css } from 'styled-components'
import tw from 'tailwind-styled-components';

function greyButtonStyle(type) {
    switch(type){
        case "scream":
            return css`
                background: white;
                border-radius: 100px;
                outline: 1px var(--black-opacity64, rgba(0, 0, 0, 0.64)) solid;
                outline-offset: -0.50px;
                color: var(--black-opacity64, rgba(0, 0, 0, 0.64));
                `

        case "shout":
            return css`
                color: var(--black-opacity64, rgba(0, 0, 0, 0.64));
                border-radius: 100px;
                outline: 2px var(--black-opacity64, rgba(0, 0, 0, 0.64)) solid;
                outline-offset: -2px;
                `
    }
}

function buttonTypeStyle(type, grey) {
    switch(type) {
        case "scream": 
            return grey ? greyButtonStyle(type) : css`
                        color: var(--color-white-opacity-100, white);
                        background: var(--color-blue-opacity-100, #0870D3);
                        border-radius: 28px;
                        &:hover{
                            color: #075CAD;
                            background: white !important;
                            outline: 2px #075CAD solid !important;
                            outline-offset: -2px !important;
                        }

                        @media (prefers-color-scheme: dark){
                            background: var(--color-white-opacity-100, white);
                            color: #075CAD;

                            &:hover {
                                background: #075CAD !important;
                                color: var(--color-white-opacity-100, white);
                                outline: 2px white solid !important;
                                outline-offset: -2px !important;
                            }
                        }
                    `;
                    
        case "shout":
            return grey ? greyButtonStyle(type) : css`
                    background: none;
                    color: #0870D3;
                    outline: 2px #0870D3 solid;
                    outline-offset: -2px;
                    border-radius: 28px;
                    &:hover{
                        color: var(--color-white-opacity-100, #FFF);
                        background: #075CAD !important;
                    }

                    @media (prefers-color-scheme: dark){
                        color: var(--color-white-opacity-100, #FFF);
                        outline: 2px white solid;
                        outline-offset: -2px;

                        &:hover {
                            color: #075CAD;
                            background: var(--color-white-opacity-100, white);
                        }
                    }
                `

        case "cheer":
            return css`
                background: none;
                justify-content: center;
                align-items: center;
                gap: 8px;
                display: inline-flex;
                color: #0870D3;
                word-wrap: break-word;
                padding: 0;
                svg {
                    border-radius: 9999px;
                    padding: 4px;
                    width: 16px;
                    height: 16px;
                    border-radius: 9999px;
                    border: 2px #0870D3 solid;
                }

                @media (prefers-color-scheme: dark) {
                    color: var(--color-white-opacity-100, white);
                }
            `

        case "murmur":
            return css`
                background: none;
                color: #0870D3;
                justify-content: center;
                align-items: center;
                gap: 8px;
                display: inline-flex;
                padding: 0;
                svg {
                    width: 16px;
                    height: 16px;
                }

                @media (prefers-color-scheme: dark) {
                    color: var(--color-white-opacity-100, white);
                }
            `

        case "circle":
            return css`
                background: var(--color-white-opacity-100, white);
                box-shadow: 0px 16px 16px rgba(0, 0, 0, 0.32);
                border-radius: 9999px;
            `
    }
}

function sizeButton(buttonType, icon, size) {
    switch(true) {
        case icon && buttonType !== "circle":
            return css`
                padding-top: ${size === "large" ? "14px": size === "regular" ? "12px" : "8px"};
                padding-bottom: ${size === "large" ? "14px": size === "regular" ? "12px" : "8px"};
                padding-left: ${size === "large" ? "24px": size === "regular" ? "16px" : "12px"};
                padding-right: ${size === "large" ? "28px": size === "regular" ? "20px" : "12px"};
                gap: ${size === "large" ? "8px" : size === "regular" ? "8px" : "4px"};
                justify-content: center;
                align-items: center;
                border:none;
            `

        case !icon && buttonType !== "circle":
            return css`
                padding-left: ${size === "large" ? "40px": size === "regular" ? "24px" : "16px"};
                padding-right: ${size === "large" ? "40px": size === "regular" ? "24px" : "16px"};
                padding-top: ${size === "large" ? "14px": size === "regular" ? "12px" : "9.50px"};
                padding-bottom: ${size === "large" ? "14px": size === "regular" ? "12px" : "9.50px"};
                gap: 10px;
                justify-content: flex-start;
                align-items: flex-start;
            `

        default:
            return css`
                padding: ${(size === "large" || size === "regular") ? "24px" : "12px"};
                min-width: ${(size === "large" || size === "regular") ? "64px" : "40px"};
                min-height: ${(size === "large" || size === "regular") ? "64px" : "40px"};
            `
    }
}

const buttonStyle = styled.button`
    border: none;
    display: inline-flex;
    cursor: pointer;
    font-feature-settings: 'liga' off, 'clig' off;
    font-size: ${({size}) => size === "large" ? "18px" : size === "regular" ? "16px" : "13px"};
    line-height: ${({size}) => size === "large" ? "18px" : size === "regular" ? "16px" : "13px"};
    ${({ icon, size, buttonType }) => (buttonType !== "cheer" || buttonType !== "murmur" || buttonType !== "circle") && sizeButton(buttonType, icon, size)}
    ${({ buttonType, greyButton }) => buttonTypeStyle(buttonType, greyButton)}
`

/**
 * @type {import('tailwind-styled-components/dist/tailwind').TailwindComponent<'web', {
 * size: "large" | "regular" | "small";
 * icon: boolean;
 * buttonType: "scream" | "shout" | "cheer" | "murmur" | "circle";
 * greyButton: boolean;
 * weight: "regular" | "italic" | "semibold" | "semibold-italic" | "bold" | "bold-italic"
 * } & React.HTMLAttributes<HTMLButtonElement>>}
 */
export const Button = tw(buttonStyle)`
    ${props => props.weight}
` 