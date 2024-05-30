const express = require('express');
const router = express.Router();
const { validarOrden } = require('../controllers/validarOrdenControllers');

router.get('/validar-orden', validarOrden);

module.exports = router;
