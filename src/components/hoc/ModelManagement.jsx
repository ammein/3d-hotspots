import { useState } from 'react';

const withModelManagement = (WrappedComponent) => {
  return (props) => {
    const [wireframe, setWireframe] = useState(false);
    const [hotspotID, setHotspotID] = useState(null);
    const [rotationDegree, setRotationDegree] = useState(0);
    const callback = (type, value) => {
      switch (type) {
        case 'mode':
          setWireframe(Boolean(value));
          break;

        case 'hotspot':
          setHotspotID(value);
          break;

        case 'rotation':
          setRotationDegree(Number(value));
          break;

        default:
          throw new Error(
            'You did not set any valid type for updating state. \nType supported:\n1. mode\n2. hotspot\n3. rotation'
          );
      }
    };

    return (
      <WrappedComponent
        wireframe={wireframe}
        hotspotID={hotspotID}
        rotationDegree={rotationDegree}
        modelCallback={callback}
        {...props}
      />
    );
  };
};

export default withModelManagement;
