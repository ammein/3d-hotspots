import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculateCurrentValue } from '@/helpers/utils';
import { useDebounce } from '@uidotdev/usehooks';

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
 * @param {boolean} props.isLast
 * @param {number} props.index
 * @param {number} props.shortStepHeight
 * @param {number} props.longStepHeight
 * @param {number} props.gapBetweenSteps
 * @param {number} props.stepWidth
 * @param {string} props.shortStepColor
 * @param {string} props.longStepColor
 */
export const RulerPickerItem = ({
  isLast,
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
    initialValue = useDebounce(min, 2000),
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
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          padding: 0,
          margin: 0,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          pointerEvents: 'none',
        }}
        className="ruler-container"
      >
        <div
          style={{
            display: 'inline-block',
            width: width * 0.5 - stepWidth * 0.5,
          }}
        />
        {arrData.map((_, index) => (
          <div
            key={index}
            style={{
              scrollSnapAlign: 'start',
              display: 'inline-block',
            }}
          >
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
            display: 'inline-block',
            width: width * 0.5 - stepWidth * 0.5,
          }}
        />
      </div>

      {/* Indicator: small centered container so the vertical line is centered exactly */}
      <div
        style={{
          position: 'absolute',
          top: indicatorHeight + 'px',
          left: '50%',
          transform: `translate(${indicatorXOffset}px, ${-indicatorHeight}px)`, // center horizontally; vertical will be handled below
          width: stepWidth,
          height: indicatorHeight + textHeight + 8, // extra space for value text above
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: textHeight,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: valueFontSize,
              fontWeight: 800,
              color: (valueTextStyle && valueTextStyle.color) || 'black',
              lineHeight: `${valueFontSize}px`,
              textAlign: 'center',
            }}
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

      <style>{`
                .ruler-container::-webkit-scrollbar { display: none; }
                .ruler-container { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
    </div>
  );
};

/**
 * Ruler Picker Component
 * @param {import('react').NamedExoticComponent<RulerPicker>}
 * @returns
 */
export default memo(RulerPicker);
