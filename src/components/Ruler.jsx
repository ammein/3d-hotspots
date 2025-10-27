import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculateCurrentValue } from '@/helpers/utils';
import { useDebounce } from '@uidotdev/usehooks';
import RulerCSS from '@/stylesheets/modules/Ruler.module.css';

/**
 * Replicate from this library:
 * https://github.com/rnheroes/react-native-ruler-picker
 */

/**
 * @callback ValueChange
 * @param {number}
 */

/**
 * @typedef {Object} RulerPicker
 * @property {number} width
 * @property {number} height
 * @property {number} min
 * @property {number} max
 * @property {number} step
 * @property {number} initialValue
 * @property {number} fractionDigits
 * @property {string} unit
 * @property {number} indicatorHeight
 * @property {number} indicatorXOffset
 * @property {number} gapBetweenSteps
 * @property {number} shortStepHeight
 * @property {number} longStepHeight
 * @property {number} stepWidth
 * @property {string} indicatorColor
 * @property {string} shortStepColor
 * @property {string} longStepColor
 * @property {{ color: string, fontSize: number }} valueTextStyle
 * @property {{ color: string, fontSize: number }} unitTextStyle
 * @property {ValueChange} onValueChange
 * @property {ValueChange} onValueChangeEnd
 */

/**
 * Minimal web version of a ruler item. Replace or style to match your RN look.
 *
 * @param {Object} props
 * @param {number} props.index
 * @param {number} props.shortStepHeight
 * @param {number} props.longStepHeight
 * @param {number} props.gapBetweenSteps
 * @param {number} props.stepWidth
 * @param {string} props.shortStepColor
 * @param {string} props.longStepColor
 */
export const RulerPickerItem = ({
  index,
  shortStepHeight,
  longStepHeight,
  gapBetweenSteps,
  stepWidth,
  shortStepColor,
  longStepColor,
}) => {
  const height = index % 10 === 0 ? longStepHeight : shortStepHeight;
  const color = index % 10 === 0 ? longStepColor : shortStepColor;

  return (
    <div
      aria-hidden
      style={{
        display: 'inline-block',
        width: stepWidth + gapBetweenSteps,
        boxSizing: 'content-box',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: stepWidth,
          height,
          background: color,
          margin: '0 auto',
        }}
      />
    </div>
  );
};

/**
 * RulerPicker (web)
 *
 * Props mirror your RN component (JSX version).
 *
 * @param {RulerPicker} props
 */
const RulerPicker = (props) => {
  const {
    width = typeof window !== 'undefined' ? window.innerWidth : 1024,
    height = 500,
    min,
    max,
    step = 1,
    fractionDigits = 1,
    unit = 'cm',
    indicatorHeight = 80,
    indicatorXOffset = 0,
    gapBetweenSteps = 10,
    shortStepHeight = 20,
    longStepHeight = 40,
    stepWidth = 2,
    indicatorColor = 'black',
    shortStepColor = 'lightgray',
    longStepColor = 'darkgray',
    valueTextStyle,
    unitTextStyle,
    onValueChange,
    onValueChangeEnd,
  } = props;

  const minDebounced = useDebounce(min, 2000);

  const initialValue = !props.initialValue ? minDebounced : props.initialValue;

  const itemAmount = Math.floor((max - min) / step);
  const arrData = useMemo(() => Array.from({ length: itemAmount + 1 }, (_, index) => index), [itemAmount]);

  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const scrollTimeout = useRef(null);

  const [displayValue, setDisplayValue] = useState(initialValue.toFixed(fractionDigits));
  const lastMomentumValue = useRef(initialValue.toFixed(fractionDigits));
  const [textHeight, setTextHeight] = useState((valueTextStyle && valueTextStyle.fontSize) || 32);
  const valueRef = useRef(null);

  const initialIndex = Math.floor((initialValue - min) / step);
  const stepSpacing = stepWidth + gapBetweenSteps;
  const initialOffset = initialIndex * stepSpacing;

  const getValueFromScroll = useCallback(
    (scrollLeft) => {
      return calculateCurrentValue(scrollLeft, stepWidth, gapBetweenSteps, min, max, step, fractionDigits);
    },
    [fractionDigits, gapBetweenSteps, stepWidth, max, min, step]
  );

  // Measure the display text height once (to align vertically)
  useEffect(() => {
    if (valueRef.current) {
      const rect = valueRef.current.getBoundingClientRect();
      // use ceil to avoid sub-pixel cropping
      setTextHeight(Math.ceil(rect.height));
    }
  }, [valueTextStyle, displayValue]);

  const handleScrollFrame = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const newStep = getValueFromScroll(scrollLeft);

    setDisplayValue((prev) => {
      if (prev !== newStep) {
        onValueChange && onValueChange(newStep);
        return newStep;
      }
      return prev;
    });

    // debounce scroll end
    if (scrollTimeout.current) {
      window.clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = window.setTimeout(() => {
      const momentumStep = getValueFromScroll(containerRef.current.scrollLeft);
      if (lastMomentumValue.current !== momentumStep) {
        onValueChangeEnd && onValueChangeEnd(momentumStep);
      }
      lastMomentumValue.current = momentumStep;
    }, 120);
  }, [getValueFromScroll, onValueChange, onValueChangeEnd]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // initial scroll position
    el.scrollLeft = initialOffset;

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        handleScrollFrame();
        if (rafRef.current) {
          window.cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = null;
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });

    // initial update
    handleScrollFrame();

    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleScrollFrame, initialOffset]);

  const valueFontSize = (valueTextStyle && valueTextStyle.fontSize) || 32;
  const unitFontSize = (unitTextStyle && unitTextStyle.fontSize) || 24;

  // Precise indicator container: centered relative to the scroll container's visible area.
  // We position the indicator at left: 50% of the RulerPicker root (which matches visible center),
  // but use a small fixed-width container (stepWidth) so the vertical line remains centered independent of text width.
  return (
    <div style={{ width, height, position: 'relative' }}>
      <div ref={containerRef} className={RulerCSS.RulerContainer}>
        <div
          style={{
            width: width * 0.5 - stepWidth * 0.5,
          }}
          className={RulerCSS.RulerWrapper}
        />
        {arrData.map((_, index) => (
          <div key={index} className={RulerCSS.RulerChildWrapper}>
            <RulerPickerItem
              isLast={index === arrData.length - 1}
              index={index}
              shortStepHeight={shortStepHeight}
              longStepHeight={longStepHeight}
              gapBetweenSteps={gapBetweenSteps}
              stepWidth={stepWidth}
              shortStepColor={shortStepColor}
              longStepColor={longStepColor}
            />
          </div>
        ))}
        <div
          style={{
            width: width * 0.5 - stepWidth * 0.5,
          }}
          className={RulerCSS.RulerSpacer}
        />
      </div>

      {/* Indicator: small centered container so the vertical line is centered exactly */}
      <div
        style={{
          top: indicatorHeight + 'px',
          transform: `translate(${indicatorXOffset}px, ${-indicatorHeight}px)`, // center horizontally; vertical will be handled below
          width: stepWidth,
          height: indicatorHeight + textHeight + 8, // extra space for value text above
        }}
        className={RulerCSS.IndicatorWrapper}
      >
        {/* Vertical center line */}
        <div
          style={{
            width: stepWidth,
            height: indicatorHeight,
            background: indicatorColor,
          }}
        />
        {/* Value positioned above line with precise offset */}
        <div
          ref={valueRef}
          style={{
            height: textHeight,
            marginBottom: 8,
          }}
          className={RulerCSS.IndicatorTextWrapper}
        >
          <div
            style={{
              fontSize: valueFontSize,
              fontWeight: 800,
              color: (valueTextStyle && valueTextStyle.color) || 'black',
              lineHeight: `${valueFontSize}px`,
            }}
            className={RulerCSS.IndicatorText}
          >
            {displayValue}
          </div>
          {unit && (
            <div
              style={{
                fontSize: unitFontSize,
                fontWeight: 400,
                color: (unitTextStyle && unitTextStyle.color) || 'black',
                lineHeight: `${unitFontSize}px`,
                marginLeft: 6,
              }}
            >
              {unit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Ruler Picker Component
 * @param {import('react').NamedExoticComponent<RulerPicker>}
 * @returns
 */
export default memo(RulerPicker);
