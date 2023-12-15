// use express
const express = require('express');
const cors = require('cors');
const Knex = require('knex');
const { Model } = require('objection');
<<<<<<< Updated upstream
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const vesselRouter = require('./router/vesselRouter');
=======
const sdk = require('api')('@searoutes-docs/v2.0#14s2xo1blp0yncgo');
const fs = require('fs');
const path = require('path');
>>>>>>> Stashed changes

const Vessel = require('./model/Vessel');

const knex = Knex({
<<<<<<< Updated upstream
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: '../vessel.sqlite'
    }
});

// Give the knex instance to objection.
=======
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: '../vessel.sqlite',
  },
});

// Add your actual API keys
const apiKeys = ['HtO3NcFc9Oghha0HhOAFaHIloSd13As4DQDIDrU3', 'bvqAXYx7Vj2PEAbSHiqx26W9zRcauglS6tVxernf', 'TOpJLhrhIz22rl8CcveyKahvTKye3AwJwV8QMgwf'];
let currentApiKeyIndex = 0;

const getNextApiKey = () => {
  currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
  return apiKeys[currentApiKeyIndex];
};

const fetchVesselEtaFromDb = async () => {
    try {
      // Fetch all IMO numbers from the database
      const results = await Vessel.query().select('IMO');
  
      // Filter out undefined values
      const imos = results.filter(result => result.IMO).map(result => result.IMO);
  
      if (imos.length > 0) {
        // Process each IMO number
        for (const imo of imos) {
          let retryCount = 0;
          let success = false;
  
          while (!success && retryCount < 3) {
            try {
              const apiKey = getNextApiKey();
              sdk.auth(apiKey);
  
              const traceResponse = await sdk.getVesselTrace({
                imo,
                departureDateTime: '2023-11-23T15:00:00Z',
                arrivalDateTime: '2023-11-30T16:00:00Z',
              });
  
              // Log or process the response as needed
              console.log(`Vessel trace for IMO ${imo} using API key ${apiKey}:`, traceResponse.data);
  
              // Write data to a JSON file with a comma after each entry
              const outputFilePath = path.join(__dirname, 'vessel_trace_data.json');
              const entryJson = JSON.stringify(traceResponse.data, null, 2) + ',';
              fs.writeFileSync(outputFilePath, entryJson, { flag: 'a' });
  
              console.log(`Vessel trace data written to vessel_trace_data.json for IMO ${imo}.`);
              success = true;
            } catch (error) {
              if (error.status === 404) {
                console.warn(`Vessel trace not found for IMO ${imo}. Proceeding to the next IMO.`);
                success = true;  // Consider it a success to proceed to the next iteration
              } else if (error.status === 429) {
                const retryDelay = Math.pow(2, retryCount) * 1000;
                console.warn(`Rate limited. Retrying in ${retryDelay} milliseconds...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryCount++;
              } else {
                throw error;  // Re-throw other errors
              }
            }
          }
  
          if (!success) {
            console.error(`Failed to fetch vessel trace for IMO ${imo} after multiple retries.`);
          }
        }
  
        console.log('Vessel trace data processing complete.');
      } else {
        console.log('No valid IMO numbers found in the database.');
      }
    } catch (error) {
      console.error('Error fetching or writing vessel trace data:', error);
    }
};
  
>>>>>>> Stashed changes
Model.knex(knex);

const app = express();
const port = 3012;

app.use(cors());
app.use(express.json());
<<<<<<< Updated upstream
app.use('/vessel', vesselRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Endpoint to trigger the vessel trace data fetch
app.get('/fetchVesselTrace', async (req, res) => {
  console.log('Fetching vessel trace data...');
  await fetchVesselEtaFromDb();

  // Delay for 1 minute before allowing the next request
  setTimeout(() => {
    res.send('Vessel trace data fetch initiated.');
  }, 60000); // 60000 milliseconds = 1 minute
});

app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
=======

// Endpoint to trigger the vessel trace data fetch
app.get('/fetchVesselTrace', async (req, res) => {
  console.log('Fetching vessel trace data...');
  await fetchVesselEtaFromDb();

  // Delay for 1 minute before allowing the next request
  setTimeout(() => {
    res.send('Vessel trace data fetch initiated.');
  }, 60000); // 60000 milliseconds = 1 minute
});

app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});

>>>>>>> Stashed changes
