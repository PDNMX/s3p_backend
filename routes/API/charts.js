var express = require('express');
var router = express.Router();
var cors = require('cors');


const {Client} = require('pg');

const connectionData = {
    user: process.env.USER_POSTGRES,
    host: process.env.HOST_POSTGRES,
    database: process.env.DATABASE_VIZ_S3,
    password: process.env.PASSWORD_POSTGRES,
    port: process.env.PORT_POSTGRES
};


router.get('/getSentidoSanciones', cors(), (req, res) => {
    const client = new Client(connectionData);
    client.connect();
    let query = "select sentido_de_resolucion,count(*) as  total  from proveedores_sancionados where sentido_de_resolucion  NOT LIKE '18/01/2016' group by sentido_de_resolucion order by total desc;";
    //console.log(query);
    client.query(query)
        .then(response => {
            let rows = response.rows;
            client.end();
            return res.status(200).send(
                {
                    "status": 200,
                    "data": rows
                });
        })
        .catch(err => {
            client.end();
            console.log("Error : ", err);
            return res.status(400).send(
                {
                    "status": 400,
                    "mensaje": "Error al consultar BD"
                }
            )
        })
});

router.get('/getAnioSancion', cors(), (req, res) => {
    const client = new Client(connectionData);
    client.connect();
    let query = "select date_part('year',to_date(fecha_de_resolucion,'dd/mm/yyyy')) AS anio_resolucion, count(*) from proveedores_sancionados group by anio_resolucion order by anio_resolucion";
    //console.log(query)
    client.query(query)
        .then(response => {
            let rows = response.rows;
            client.end();
            return res.status(200).send(
                {
                    "status": 200,
                    "data": rows
                });
        })
        .catch(err => {
            client.end();
            console.log("Error : ", err);
            return res.status(400).send(
                {
                    "status": 400,
                    "mensaje": "Error al consultar BD"
                }
            )
        })
});

router.get('/getDependenciaMayor', cors(), (req, res) => {
    const client = new Client(connectionData);
    client.connect();
    let query = "select dependencia, count(*) as total from proveedores_sancionados group by dependencia having count(*) >=10 order by total desc";
    //console.log(query);
    client.query(query)
        .then(response => {
            let rows = response.rows;
            client.end();
            return res.status(200).send(
                {
                    "status": 200,
                    "data": rows
                });
        })
        .catch(err => {
            client.end();
            console.log("Error : ", err);
            return res.status(400).send(
                {
                    "status": 400,
                    "mensaje": "Error al consultar BD"
                }
            )
        })
});

router.get('/getSentidosAnio', cors(), (req, res) => {
    const client = new Client(connectionData);
    client.connect();
    let query = "select date_part('year',to_date(fecha_de_resolucion,'dd/mm/yyyy')) as anio, sentido_de_resolucion,count(*) as  total  from proveedores_sancionados where date_part('year',to_date(fecha_de_resolucion,'dd/mm/yyyy'))>0 group by anio,sentido_de_resolucion order by anio asc, total desc;"
    // console.log(query)
    client.query(query)
        .then(response => {
            let rows = response.rows;
            client.end();
            return res.status(200).send(
                {
                    "status": 200,
                    "data": rows
                });
        })
        .catch(err => {
            client.end();
            console.log("Error : ", err);
            return res.status(400).send(
                {
                    "status": 400,
                    "mensaje": "Error al consultar BD"
                }
            )
        })
});

router.get('/getResolucionesAnualesDependencia', cors(), (req, res) => {
    const client = new Client(connectionData);
    client.connect();
    let query = "select anio, dependencia,total from( select date_part('year',to_date(fecha_de_resolucion,'dd/mm/yyyy')) anio,dependencia, count(*) as total, ROW_NUMBER() OVER(PARTITION BY date_part('year',to_date(fecha_de_resolucion,'dd/mm/yyyy'))  ORDER BY count(*) desc) AS r from proveedores_sancionados group by anio,dependencia order by anio, total desc ) x where x.r <=10 and anio>0;";
    //console.log(query)
    client.query(query)
        .then(response => {
            let rows = response.rows;
            client.end();
            return res.status(200).send(
                {
                    "status": 200,
                    "data": rows
                });
        })
        .catch(err => {
            client.end();
            return res.status(400).send(
                {
                    "status": 400,
                    "mensaje": "Error al consultar BD"
                }
            )
        })
});

router.get('/getTotalRows', cors(), (req, res) => {
    const client = new Client(connectionData);
    client.connect();

    const query = "select count(*) from proveedores_sancionados";

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
})

router.get('/getTotalDependencias', cors(), (req, res) => {
    const client = new Client(connectionData);
    client.connect();

    const query = "select count(*) from (select dependencia from proveedores_sancionados group by dependencia) as dependencias";

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
})
router.get('/getTotalProveedores', cors(), (req, res) => {
    const client = new Client(connectionData);
    client.connect();

    const query = "select count(*) from (select proveedor_o_contratista from proveedores_sancionados group by proveedor_o_contratista) as proveedores";

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
})
router.get('/getTotalMultas', cors(), (req, res) => {
    const client = new Client(connectionData);
    client.connect();

    const query = "select SUM(CAST(monto AS DOUBLE PRECISION)) as total from proveedores_sancionados WHERE MONTO != ''";

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
})
module.exports = router;