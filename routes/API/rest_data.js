const axios = require('axios');
const qs = require('qs');
const fs = require("fs");
const {v4: uuidv4} = require('uuid');
import generateZipForPath from "../utils/generateZipForPath";
const {exec} = require("child_process");
//En caso de error regresa un arreglo vacio para no interrumpir el flujo de las demás promises
const fetchEntities = endpoint => {
    return getToken(endpoint).then(token_data => {
        const {access_token} = token_data.data;
        const opts = {
            url: endpoint.entities_url,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            json: true,
            timeout: process.env.TIMEOUT
        };
        return axios(opts)
            .then(response => response.data)
            .catch(error => {
                    console.log(error);
                    return [];
                }
            )
    }).catch(error => {
        console.log(error);
        return [];
    });
};

const fetchData = (endpoint, options) => {
    return getToken(endpoint).then(token_data => {
        const {access_token} = token_data.data;
        let opts = {
            url: endpoint.url,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            data: options,
            json: true,
            timeout: process.env.TIMEOUT
        };
        return axios(opts).then(response => {
            let data = response.data;
            data.supplier_name = endpoint.supplier_name;
            data.supplier_id = endpoint.supplier_id;
            data.levels = endpoint.levels;
            data.endpoint_type = endpoint.type;
            return data;
        });
    });
};

const getToken = endpoint => {
    const opts = {
        url: endpoint.token_url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify({
            grant_type: 'password',
            username: endpoint.username,
            password: endpoint.password,
            client_id: endpoint.client_id,
            client_secret: endpoint.client_secret,
            scope: endpoint.scope
        }),
        json: true,
        timeout: process.env.TIMEOUT
    };
    return axios(opts);
};

const itera = (endpoint,options, idFile) => {
    if(!idFile){
        idFile = uuidv4();
        fs.mkdirSync(`./${idFile}`);
    }
    return fetchData(endpoint, options).then( async(res) => {
        let {pagination, results} = res;
        let path = `./${idFile}/${endpoint.supplier_id}_${pagination.page}.json`;
        let data = JSON.stringify(results);
        fs.writeFileSync(path, data);
        let hasNextPage = (Math.trunc(pagination.totalRows / (pagination.pageSize * pagination.page)));
        if (pagination.hasNextPage || hasNextPage > 0) {
            options.page += 1;
            return itera(endpoint, options, idFile);
        } else{
            let aux = await generateZipForPath(`${idFile}`);
            return idFile;
        }
    }).catch(error => {
        console.log(error)
        return null;
    });
};

const getBulk = async (endpoint,options) => {
    let idFile = await itera(endpoint,options);
    return idFile;
}
module.exports = {
    fetchData,
    fetchEntities,
    getBulk
};