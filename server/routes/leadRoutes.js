const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  addNote,
  exportLeadsCSV,
  createLeadValidation,
  updateLeadValidation,
} = require('../controllers/leadController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validate');

// All lead routes are protected
router.use(auth);

// CSV export must be before /:id to avoid matching 'export' as an id
router.get('/export/csv', exportLeadsCSV);

// CRUD routes
router.get('/', getLeads);
router.get('/:id', getLead);
router.post('/', createLeadValidation, validate, createLead);
router.put('/:id', updateLeadValidation, validate, updateLead);
router.delete('/:id', roleAuth('admin', 'manager'), deleteLead);

// Status update (Kanban)
router.patch('/:id/status', updateLeadStatus);

// Notes
router.post('/:id/notes', addNote);

module.exports = router;
