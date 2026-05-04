const express = require('express');
const {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription
} = require('../controllers/prescriptionController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getPrescriptions)
  .post(createPrescription);

router.route('/:id')
  .get(getPrescription)
  .put(updatePrescription)
  .delete(deletePrescription);

module.exports = router;