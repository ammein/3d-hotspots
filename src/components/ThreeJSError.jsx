import Button from '@/components/Button';
import CloseIcon from '@/design-system/icons/close-big.svg?react';
import { useCallback, useState } from 'react';
import { Html } from '@react-three/drei';
import Headline from '@/components/Headline';
import Body from '@/components/Body';

function Error({ errorStatus, errorMessage, reset }) {
  const [close, setClose] = useState(false);

  const closeClick = useCallback((e) => {
    e.preventDefault();
    setClose(true);
    reset();
  });

  return (
    <Html
      as={'div'}
      wrapperClass={`w-full !fixed !top-0 !left-0 !transform-none ${
        close ? ' !hidden' : ''
      }`}
    >
      <div className="!w-full h-fit !fixed bottom-0 left-0">
        <div className="inline-flex flex-col justify-start items-center gap-9 w-full">
          <div className="w-full p-3.5 bg-white flex flex-row items-center gap-12 bg-darkgrey drop-shadow-2xl justify-between">
            <div className="flex flex-col justify-start items-start gap-4">
              <Headline type="h2">{errorStatus}</Headline>
              <Body className="whitespace-pre-wrap">{errorMessage}</Body>
            </div>
            <Button
              $buttonType="scream"
              $icon={true}
              onClick={closeClick}
              $size="regular"
              $other={/* tailwindcss */ 'right-0'}
            >
              <CloseIcon />
              <b className="!font-bold whitespace-nowrap">Reset</b>
            </Button>
          </div>
        </div>
      </div>
    </Html>
  );
}

export default Error;
