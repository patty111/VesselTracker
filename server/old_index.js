const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const Knex = require('knex');
const { Model } = require('objection');
const sdk = require('api')('@searoutes-docs/v2.0#14s2xo1blp0yncgo');
const fs = require('fs');
const path = require('path');

const Vessel = require('./model/Vessel');

const knex = Knex({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: '../vessel.sqlite'
  }
});

// Set the API key for authentication
sdk.auth('QlD5RsF4sa8vkKArO3dCk45IEzSkDpkg9W8qaZsi'); // Replace with your actual API key

// const fetchVesselEtaFromDb = async () => {
//     try {
//       // Fetch all IMO numbers from the database
//       const results = await Vessel.query().select('IMO'); // Use uppercase 'IMO'
  
//       // Log the fetched results
//       console.log('Fetched results from the database:', results);
  
//       // Filter out undefined values
//       const imos = results.filter(result => result.IMO).map(result => result.IMO); // Use uppercase 'IMO'
  
//       if (imos.length > 0) {
//         // Log the fetched IMO numbers
//         console.log('Fetched valid IMO numbers from the database:', imos);
  
//         // Process each batch of 10 IMO numbers
//         const batchSize = 10;
//         for (let i = 0; i < imos.length; i += batchSize) {
//           const batchImos = imos.slice(i, i + batchSize);
//           const imosString = batchImos.join(',');
  
//           // Fetch vessel ETA for the current batch of IMO numbers from the database
//           const response = await sdk.getVesselPosition({ imos: imosString });
  
//           // Log or process the response as needed
//           console.log('Vessel ETA for batch:', response.data);
  
//           // Write data to a JSON file
//           const outputFilePath = path.join(__dirname, 'vessel_eta_data.json');
//           fs.writeFileSync(outputFilePath, JSON.stringify(response.data, null, 2), { flag: 'a' });
  
//           console.log('Vessel ETA data written to vessel_eta_data.json for batch:', batchImos);
//         }
  
//         console.log('Vessel ETA data processing complete.');
//       } else {
//         console.log('No valid IMO numbers found in the database.');
//       }
//     } catch (error) {
//       console.error('Error fetching or writing vessel ETA data:', error);
//     }
//   };
  
  // cron.schedule('0 * * * *', () => {
  //   console.log('Fetching vessel ETA from database...');
  //   fetchVesselEtaFromDb();
  // });


Model.knex(knex);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
// Additional middleware and route setup...

const fetchVesselEtaFromDb = async () => {
  try {
    // Fetch all IMO numbers from the database
    const results = await Vessel.query().select('IMO'); // Use uppercase 'IMO'

    // Log the fetched results
    console.log('Fetched results from the database:', results);

    // Filter out undefined values
    const imos = results.filter(result => result.IMO).map(result => result.IMO); // Use uppercase 'IMO'

    if (imos.length > 0) {
      // Log the fetched IMO numbers
      console.log('Fetched valid IMO numbers from the database:', imos);

      for (const imo of imos) {
        // Fetch vessel trace for the current IMO from the external API
        const traceResponse = await sdk.getVesselTrace({
          imo,
          departureDateTime: '2023-11-23T15:00:00Z',
          arrivalDateTime: '2023-11-30T16:00:00Z'
        });

        // Log or process the response as needed
        console.log(`Vessel trace for IMO ${imo}:`, traceResponse.data);

        // Write data to a JSON file
        const outputFilePath = path.join(__dirname, 'vessel_trace_data.json');
        fs.writeFileSync(outputFilePath, JSON.stringify(traceResponse.data, null, 2), { flag: 'a' });

        console.log(`Vessel trace data written to vessel_trace_data.json for IMO ${imo}.`);
      }

      console.log('Vessel trace data processing complete.');
    } else {
      console.log('No valid IMO numbers found in the database.');
    }
  } catch (error) {
    console.error('Error fetching or writing vessel trace data:', error);
  }
};

// Endpoint to trigger the vessel trace data fetch
app.get('/fetchVesselTrace', async (req, res) => {
  console.log('Fetching vessel trace data...');
  await fetchVesselEtaFromDb();
  res.send('Vessel trace data fetch initiated.');
});


app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
