const express = require('express');
const vesselController = require('../controller/VesselController'); // Change the filename to use the correct casing
const router = express.Router();

// get all vessels
router.get('/', vesselController.getAllVessels);

// get vessel by name
router.get('/:name', vesselController.getVesselByName);

// get vessels by type
router.get('/type/:type', vesselController.getVesselByType);


module.exports = router;