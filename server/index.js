// use express
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const Knex = require('knex');
const { Model } = require('objection');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const vesselRouter = require('./router/vesselRouter');

const Vessel = require('./model/Vessel');

const knex = Knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: '../vessel.sqlite'
    }
});

// Give the knex instance to objection.
Model.knex(knex);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/vessel', vesselRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});