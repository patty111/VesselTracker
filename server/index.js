const express = require('express');
const cors = require('cors');
const Knex = require('knex');
const { Model } = require('objection');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const vesselRouter = require('./router/vesselRouter');
const sdk = require('api')('@searoutes-docs/v2.0#14s2xo1blp0yncgo');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Vessel = require('./model/Vessel');

const knex = Knex({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: '../vessel.sqlite',
  },
});

const apiKeys = ['HtO3NcFc9Oghha0HhOAFaHIloSd13As4DQDIDrU3', 'bvqAXYx7Vj2PEAbSHiqx26W9zRcauglS6tVxernf', 'TOpJLhrhIz22rl8CcveyKahvTKye3AwJwV8QMgwf'];
let currentApiKeyIndex = 0;

const getNextApiKey = () => {
  currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
  return apiKeys[currentApiKeyIndex];
};

// Connect to MongoDB
mongoose.connect('mongodb+srv://41071105H:41071105H@cluster0.h9q2tfk.mongodb.net/VesselTracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the VesselTrace model only once
const VesselTraceModel = mongoose.model('routes', new mongoose.Schema({}, { strict: false }));

const fetchVesselEtaFromDb = async () => {
  try {
    const results = await Vessel.query().select('IMO');
    const imos = results.filter(result => result.IMO).map(result => result.IMO);

    if (imos.length > 0) {
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

            console.log(`Vessel trace for IMO ${imo} using API key ${apiKey}:`, traceResponse.data);

            // Store trace data in MongoDB
            const vesselTraceData = new VesselTraceModel(traceResponse.data);
            await vesselTraceData.save();

            // Store trace data in JSON file
            const outputFilePath = path.join(__dirname, 'vessel_trace_data.json');
            const entryJson = JSON.stringify(traceResponse.data, null, 2) + ',';
            fs.writeFileSync(outputFilePath, entryJson, { flag: 'a' });

            console.log(`Vessel trace data written to MongoDB and vessel_trace_data.json for IMO ${imo}.`);
            success = true;
          } catch (error) {
            if (error.status === 404) {
              console.warn(`Vessel trace not found for IMO ${imo}. Proceeding to the next IMO.`);
              success = true;
            } else if (error.status === 429) {
              const retryDelay = Math.pow(2, retryCount) * 1000;
              console.warn(`Rate limited. Retrying in ${retryDelay} milliseconds...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              retryCount++;
            } else {
              throw error;
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

Model.knex(knex);

const app = express();
const port = 3012;

app.use(cors());
app.use(express.json());
app.use('/vessel', vesselRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/fetchVesselTrace', async (req, res) => {
  console.log('Fetching vessel trace data...');
  await fetchVesselEtaFromDb();

  // Delay for 1 minute before allowing the next request
  setTimeout(() => {
    res.send('Vessel trace data fetch initiated.');
  }, 60000);
});

app.get('/api/vesselTraceData', async (req, res) => {
  try {
    // Fetch vessel trace data from MongoDB
    const traceData = await VesselTraceModel.find(); // Adjust this query based on your MongoDB model
    res.json(traceData);
  } catch (error) {
    console.error('Error fetching vessel trace data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});