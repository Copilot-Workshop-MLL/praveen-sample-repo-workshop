const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { validateEmployee } = require('../middleware/validateMiddleware');
const {
  getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee
} = require('../controllers/employeeController');

router.use(authMiddleware);

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', validateEmployee, createEmployee);
router.put('/:id', validateEmployee, updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
