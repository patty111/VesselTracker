import React, { useState, useEffect } from 'react';
import Globe from 'react-globe.gl';

// Utility function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const World = () => {
  const [vesselPaths, setVesselPaths] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3012/api/getVesselTraceData')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((traceResponseData) => {
        if (traceResponseData && traceResponseData.length > 0) {
          let paths = [];
          traceResponseData.forEach((featureCollection) => {
            featureCollection.features.forEach(({ geometry, properties }) => {
              geometry.coordinates.forEach((coords) => {
                const randomColor = getRandomColor();
                paths.push({ coords, vessel: { properties, color: randomColor } });
              });
            });
          });

          setVesselPaths(paths);
          console.log('Vessel trace data processed:', paths);
        } else {
          console.error('Invalid or missing features array in trace data:', traceResponseData);
        }
      })
      .catch((error) => console.error('Error loading trace data:', error));
  }, []);

  return (
    <Globe
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      pathsData={vesselPaths}
      pathPoints="coords"
      pathPointLat={(p) => p[1]}
      pathPointLng={(p) => p[0]}
      pathColor={(path) => path.vessel.color}
      pathLabel={(path) => path.vessel.properties.vessel.imo + "\n" + path.vessel.properties.vessel.name}
      pathDashLength={0.1}
      pathDashGap={0.008}
      pathDashAnimateTime={12000}
    />
  );
};

export default World;
