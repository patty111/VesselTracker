const Vessel = require('../model/Vessel');
const vesselType = require('../model/VesselType');

exports.getAllVessels = async (req, res) => {
  const vessels = await Vessel.query();
  res.json(vessels);
};

exports.getVesselByName = async (req, res) => {
  const vessel = await Vessel.query().where('ShipName', req.params.name);
  if (vessel.length == 0)
    return res.status(404).json({message: 'Vessel not found'});

  res.json(vessel);
};

exports.getVesselByType = async (req, res) => {
  if (!Object.values(vesselType).includes(req.params.type))
    return res.status(400).json({message: 'Type not exist'});

  const vessels = await Vessel.query().where('type', req.params.type);
  res.json(vessels);
};
