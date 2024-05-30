const { validarOrden } = require('../controllers/validarOrdenControllers.js');
const { connectToDatabase, closeDatabaseConnection } = require('../config/database.js');
const mock =  require('../config/mock.js')
const sql = require('mssql');

// Mockear las dependencias externas
jest.mock('../config/database.js');
jest.mock('mssql');

describe('validarOrden', () => {
  // Limpiar los mocks después de cada prueba
  afterEach(() => {
      jest.clearAllMocks();
  });

it('debería ir con parametros 200', async () => {
    const req = { body: { data: [ { os: 66284230 },{ os: 66284231 }]}};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // Mock de la respuesta de la consulta SQL
    const mockResponse = {"osIngresadas": [], "osNoIngresadas": [66284230, 66284231]};
    sql.query.mockResolvedValue({ recordset: mockResponse });

    await validarOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
});

it('Caso cuando la Os no existe en la base de dtos y se agrega a la lista para insertar', async () => {
  const req = { body: { data: [ { os: 66284230 },{ os: 66284231 }]}};
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  // Mock de la respuesta de la consulta SQL
  const mockResponse = [];
  sql.query.mockResolvedValue({ recordset: mockResponse });

  await validarOrden(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({"osIngresadas": [66284230, 66284231], "osNoIngresadas": []});
});


it('debería devolver un error si faltan parámetros', async () => {
  const req = { body: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await validarOrden(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: 'Parámetros faltantes o vacíos' });
});



it('debería manejar excepciones correctamente', async () => {
  const req = { body: { data: [ { os: 66284230 },{ os: 66284231 }]}};
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  // Mock para forzar un error en la consulta SQL
  const mockError = new Error("Error en la base de datos");
  sql.query.mockRejectedValue(mockError);

  await validarOrden(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: `Error en el servidor [validar-orden-ms] :  ${mockError.message}` });
});

});
