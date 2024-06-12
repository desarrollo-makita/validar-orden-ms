const axios = require('axios');
const logger = require('../config/logger.js');
const { connectToDatabase, closeDatabaseConnection } = require('../config/database.js');
const sql = require('mssql');

/**
 * Funcion que valida orden de servicio, consulta en base d e datos si existe con su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function validarOrden(req , res){
    try{
       
        
        logger.info(`Iniciamos la funcion validarOrden`);

        if (!req.body) {
            logger.error(`Error: Problemas con los parametros de entrada`);
            return res.status(400).json({ error: `Parámetros faltantes o vacíos` });
        }
        
        const newArray = req.body;
        const osIngresadasList = [];
        const osNoIngresadasList = [];
        const cantidadOsIngresadas=[];
        await connectToDatabase('Telecontrol');
        for (const os of newArray) {

            const consulta = `SELECT * FROM Telecontrol.dbo.OrdenesServicio where ID_OS = '${os.os}'`;
            const result = await sql.query(consulta);
           
            if(result.recordset.length === 0){
                osIngresadasList.push(os);
                cantidadOsIngresadas.push(os.os);
            }else{
                osNoIngresadasList.push(os.os)
            }
        }
        
        if(osIngresadasList.length > 0 ){
           
            osIngresadasList;
             // microservicio insertar-orden-ms
             logger.info(`Ejecuta microservcio insertar-orden-ms`); 
             const responseInsertarOrden = await axios.post('http://172.16.1.206:3017/ms/insertar-orden', osIngresadasList );
             logger.debug(`Respuesta de microservicio insertar-orden-ms ${responseInsertarOrden}`);
        }
        
        logger.info(`Fin a la funcion validarOrden validar-orden-ms`);
       
        return  res.status(200).json({osIngresadas : cantidadOsIngresadas , osNoIngresadas : osNoIngresadasList});
    }catch (error) {
        
        // Manejamos cualquier error ocurrido durante el proceso
        logger.error(`Error en validarCliente: ${error.message}`);
        res.status(500).json({ error: `Error en el servidor [validar-orden-ms] :  ${error.message}`  });
    }finally{
        await closeDatabaseConnection();
    }
}


module.exports = {
    validarOrden
};
