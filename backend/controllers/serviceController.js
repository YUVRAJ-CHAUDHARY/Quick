const Service = require('../models/Service');

// @desc  Get all active services
// @route GET /api/services
const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create service (admin)
// @route POST /api/services
const createService = async (req, res) => {
  try {
    const { name, description, icon, basePrice } = req.body;
    const exists = await Service.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Service already exists' });

    const service = await Service.create({
      name, description, icon, basePrice,
      createdBy: req.user._id,
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update service (admin)
// @route PUT /api/services/:id
const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete service (admin)
// @route DELETE /api/services/:id
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getServices, createService, updateService, deleteService };