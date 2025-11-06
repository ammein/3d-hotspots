import { memo, useLayoutEffect, useRef, useCallback } from 'react';
import functionPlot from 'function-plot';
import DassaultButton from '@/components/Button';
import merge from 'deepmerge';

/**
 * @callback Calculations
 * @param {Array} data
 * @returns {Array<import('function-plot').FunctionPlotDatum>}
 */

/**
 * @typedef {Object} FunctionPlotParams
 * @property {Calculations} calculations
 * @property {boolean} refresh
 * @property {string} buttonText
 * @property {Array<number, number>} xAspectRatio
 * @property {Array<number, number>} yAspectRatio
 * @property {import('function-plot').FunctionPlotOptions} options
 */

/**
 * Function Plot
 * @param {FunctionPlotParams & import('react').HTMLAttributes<HTMLDivElement>} param0
 * @returns
 */
const FunctionPlot = ({ xAspectRatio, yAspectRatio, calculations, refresh, buttonText, options, ...props }) => {
  /** @type {import('react').Ref<HTMLDivElement>} */
  const rootEl = useRef(null);

  const computeYScale = (width, height, xScale) => {
    const xDiff = xScale[1] - xScale[0];
    const yDiff = (height * xDiff) / width;
    return [-yDiff / 2, yDiff / 2];
  };

  const computeXScale = (width, height, yScale) => {
    const yDiff = yScale[1] - yScale[0];
    const xDiff = (width * yDiff) / height;
    return [-xDiff / 2, xDiff / 2];
  };

  const buttonClick = (e) => {
    e.preventDefault();
    try {
      const optionsMerged = merge.all([options, setPlot(options)]);
      functionPlot(
        Object.assign({}, optionsMerged, {
          target: rootEl.current,
        })
      );
    } catch (e) {
      throw new Error(`Plot error:\n${e}`);
    }
  };

  const setPlot = useCallback(
    (options) => {
      let data = [];
      if (calculations) {
        data = calculations(data);
      }

      let xScale, yScale;
      if (xAspectRatio) {
        if (!options.width || !options.height)
          throw new Error(
            'You set aspect ratio without "width" & "height". Please set the "width" & "height" value to maintain aspect ratio'
          );
        xScale = xAspectRatio;
        yScale = computeYScale(options.width, options.height, xScale);
      } else if (yAspectRatio) {
        if (!options.width || !options.height)
          throw new Error(
            'You set aspect ratio without "width" & "height". Please set the "width" & "height" value to maintain aspect ratio'
          );
        yScale = yAspectRatio;
        xScale = computeXScale(options.width, options.height, yScale);
      }
      const finalOptions = {
        data: data ? data : undefined,
        xAxis: {
          domain: xScale ? xScale : undefined,
          ...(options.xAxis ? options.xAxis : undefined),
        },
        yAxis: {
          domain: yScale ? yScale : undefined,
          ...(options.yAxis ? options.yAxis : undefined),
        },
        xDomain: xScale ? xScale : undefined,
        yDomain: yScale ? yScale : undefined,
      };

      return finalOptions;
    },
    [xAspectRatio, calculations, yAspectRatio]
  );

  // Synchronously
  // Before the browser paints the screen
  useLayoutEffect(() => {
    try {
      const optionsMerged = merge.all([options, setPlot(options)]);
      functionPlot(
        Object.assign({}, optionsMerged, {
          target: rootEl.current,
        })
      );
    } catch (e) {
      throw new Error(`Plot error:\n${e}`);
    }
  }, [calculations, options, setPlot]);

  return (
    <>
      <div ref={rootEl} {...props} />
      {refresh && (
        <DassaultButton label={'Update'} size="small" onClick={buttonClick}>
          {buttonText ? buttonText : 'Refresh Graph'}
        </DassaultButton>
      )}
    </>
  );
};

/**
 * @param {import('react').HTMLAttributes<HTMLDivElement> & FunctionPlotParams} MainProps
 * @returns {import('react').FC<import('function-plot').FunctionPlotProps>}
 * @link https://mauriciopoppe.github.io/function-plot/
 */
export default memo(FunctionPlot, () => false);
