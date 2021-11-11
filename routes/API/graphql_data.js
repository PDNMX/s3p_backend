const axios = require('axios');
const GQL_REQUEST_TIMEOUT = parseInt(process.env.GQL_REQUEST_TIMEOUT || 30000, 10);

const fetchEntities = endpoint => {
    const query = `
                query busca{
                    results_dependencias (ordenCampo:nombre, ordenSentido:desc){
                        nombre
                    }
                }
            `;
    const opts = {
        url: endpoint.url,
        method: "POST",
        timeout: GQL_REQUEST_TIMEOUT,
        headers: {
            authorization: endpoint.token
        },
        data: JSON.stringify({
            query: query,
            variables: {},
        })
    };

    return new Promise((resolve, reject) => {
        return axios(opts).then(response => {
            let {data} = response;
            const entities = data.data.results_dependencias.map(e => {
                e.supplier_id = endpoint.supplier_id;
                return e;
            });
            resolve(entities);
        }).catch(e => {
            console.log(e);
            resolve([])
        })
    })
};

const fetchData = (endpoint, options) => {
    const {pageSize, page, query, sort} = options;

    let gql_query = `
        query busca($filtros : FiltrosInput, $limit : Int, $offset : Int, $ordenCampo: ORDEN_CAMPO, $ordenSentido: ORDEN_SENTIDO){
            results(filtros: $filtros, limit: $limit, offset : $offset, ordenCampo: $ordenCampo, ordenSentido:$ordenSentido){
                fecha_captura
                numero_expediente
                nombre_razon_social
                idtipo_persona
                rfc
                telefono
                domicilio{
                    valor
                }
                cve_tipo_sancion
                institucion_dependencia{
                    nombre
                    siglas
                }
                tipo_falta
                causa_motivo_hechos
                objeto_social
                autoridad_sancionadora
                responsable{
                    nombres
                    primer_apellido
                    segundo_apellido
                }
                resolucion{
                    sentido
                }
                fecha_notificacion
                multa{
                    monto
                    moneda
                }
                plazo{
                    fecha_inicial
                    fecha_inicial
                }
                observaciones
            }
            total(filtros:$filtros)
        }
    `;
    if (query.hasOwnProperty('nombreRazonSocial')) {
        query.nombre_razon_social = query.nombreRazonSocial;
        delete (query.nombreRazonSocial)
    }
    if (query.hasOwnProperty('tipoPersona')) {//2 moral 1-fisica
        query.idtipo_persona = query.tipoPersona === "F" ? "1" : "2";
        delete (query.tipoPersona)
    }
    if (query.hasOwnProperty('expediente')) {
        query.numero_expediente = query.expediente;
        delete (query.expediente)
    }
    if (query.hasOwnProperty('institucionDependencia')) {
        query.nombre = query.institucionDependencia;
        delete (query.institucionDependencia)
    }
    if (query.hasOwnProperty('tipoSancion')) {
        query.cve_tipo_sancion = [];
        if (query.tipoSancion.includes("I"))
            query.cve_tipo_sancion.push("I");
        if (query.tipoSancion.includes("M"))
            query.cve_tipo_sancion.push("E");
        switch (query.cve_tipo_sancion.length) {
            case 0:
                delete (query.cve_tipo_sancion)
                break;
            case 2:
                query.cve_tipo_sancion.push("EI")
                break;

        }
        delete (query.tipoSancion)
    }


    let variables = {
        "limit": pageSize,
        "offset": pageSize * (page - 1),
        "filtros": query
    };

    if (sort) {
        let campo = Object.keys(sort)[0];
        let sentido = Object.values(sort)[0];

        if (campo === 'nombreRazonSocial' || campo === 'rfc') {
            variables.ordenCampo = (campo === "nombreRazonSocial") ? "nombre_razon_social" : campo
            variables.ordenSentido = sentido
        }
    }

    const opts = {
        url: endpoint.url,
        method: 'POST',
        timeout: GQL_REQUEST_TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            authorization: endpoint.token
        },
        data: JSON.stringify({
            query: gql_query,
            variables: variables,
        })
    };

    return new Promise((resolve, reject) => {
        return axios(opts).then(response => {
            const {data} = response;
            data.supplier_name = endpoint.supplier_name;
            data.supplier_id = endpoint.supplier_id;
            data.levels = endpoint.levels;
            data.endpoint_type = endpoint.type;
            data.pagination = {
                pageSize: pageSize,
                page: page,
                totalRows: parseInt(data.total)
            };
            resolve(data);
        }).catch(e => {
            console.log("Error: ", e);
            reject(e)
        });
    });
};

module.exports = {
    fetchEntities,
    fetchData
};