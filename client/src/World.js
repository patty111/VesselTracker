import React, { useState, useEffect } from 'react';
import Globe from 'react-globe.gl';
import chroma from 'chroma-js';
import "./World.css";

// Utility function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 6) + 5]; // range from 5~11, not too dark or too bright
  }
  return color;
};

const World = ({ traceResponseData }) => {
  const [vesselPaths, setVesselPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);

  useEffect(() => {
    if (traceResponseData && traceResponseData.length > 0) {
      let vesselPaths = [];
      traceResponseData.forEach((featureCollection) => {
        featureCollection.features.forEach(({ geometry, properties }) => {
          geometry.coordinates.forEach((coords) => {
            const randomColor = getRandomColor();
            vesselPaths.push({ coords, vessel: { properties, color: randomColor } });
          });
        });
      });

      setVesselPaths(vesselPaths);
      console.log('Vessel trace data processed:', vesselPaths);
    } else {
      console.error('Invalid or missing features array in trace data:', traceResponseData);
    }
  }, [traceResponseData]);

  return (
    <>
    <Globe
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      pathsData={vesselPaths}
      pathPoints="coords"
      pathPointLat={p => p[1]}
      pathPointLng={p => p[0]}
      pathColor={path => path.vessel.color}
      pathLabel={path => path.vessel.properties.vessel.imo + "\n" + path.vessel.properties.vessel.name}
      pathDashLength={0.1}
      pathDashGap={0.008}
      pathStroke={4}
      pathDashAnimateTime={12000}
      onPathClick={(path) => {
        setSelectedPath(path);
        console.log(path);
      }}
    />

    {selectedPath && (
      <div class="gradient-cards">
        <div class="card">
          <div class="container-card" style={{
            background: `linear-gradient(71deg, #0d1212, ${chroma(selectedPath.vessel.color).darken().desaturate(0).hex()}, #0d1212)`}}
            >

            <p class="card-title">{selectedPath.vessel.properties.vessel.name}</p>
            <p class="card-description">IMO: {selectedPath.vessel.properties.vessel.imo}</p>
            <p class="card-description">{(() => {
              try {
                var coord_arr = selectedPath.vessel.properties.areas.features[0].geometry.coordinates;
                return `lat, lon:  
                  ${coord_arr[1].toFixed(2)}, ${coord_arr[0].toFixed(2)}
                  `;
              }  catch (error) {
                return "No area data available";
              }
            }
            )()}</p>
            <p class="card-description">Speed(Knots): {selectedPath.vessel.properties.speedInKts}</p>
            <p class="card-description">draft(吃水深度): {selectedPath.vessel.properties.vessel.draft}</p>
            <p class="card-description">length: {selectedPath.vessel.properties.vessel.length}</p>
            <p class="card-description">width: {selectedPath.vessel.properties.vessel.width}</p>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default World;