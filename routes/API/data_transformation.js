const{tiposSancion} = require('./code_lists');

const rest = data=>{
    data.results.forEach(d=>{
        d.tipoSancion = d.tipoSancion.map(element => {
            let temporal = tiposSancion.find(e => e.clave === element.clave);
            return temporal ? temporal : element;
        });
        d.fechaCaptura = d.fechaCaptura.substring(0,10);
        d.particularSancionado.tipoPersona = d.particularSancionado.tipoPersona === "F" ? "Física" : (d.particularSancionado.tipoPersona=== "M"? "Moral":leyenda);
    });
    return data;
}

const sfp = data => {
    let data_ = data.results.map(d=>{
        return createData(d)
    })
    data.results = data_;
    return data;
}

let createData = (item) => {
    let leyenda = "Dato no proporcionado";
    let ts = item.cve_tipo_sancion;
    let aux = [];
    if(ts==="I") aux.push({clave:"I",valor:"INHABILITACIÓN"})
    if(ts==="E") aux.push({clave:"M",valor:"MULTA"})
    if(ts==="EI") {
        aux.push({clave: "M", valor: "MULTA"})
        aux.push({clave:"I",valor:"INHABILITACIÓN"})
    }
    return {
        id: item.numero_expediente,
        fechaCaptura: item.fecha_captura ? item.fecha_captura : leyenda,
        expediente: item.numero_expediente ? item.numero_expediente : leyenda,
        institucionDependencia: {
            nombre: item.institucion_dependencia ? item.institucion_dependencia.nombre : leyenda,
            siglas: item.institucion_dependencia ? item.institucion_dependencia.siglas : leyenda
        },
        particularSancionado:{
            nombreRazonSocial: item.nombre_razon_social ? item.nombre_razon_social : leyenda,
            objetoSocial: item.objeto_social ? item.objeto_social : leyenda,
            //rfc: item.rfc ? item.rfc : leyenda,
            tipoPersona: item.idtipo_persona ? (item.idtipo_persona=== 2 ? "Moral":(item.idtipo_persona===1 ?  "Física":leyenda)) : leyenda,
        },
        objetoContrato: item.objetoContrato ? item.objetoContrato : leyenda,
        autoridadSancionadora : item.autoridad_sancionadora,
        tipoFalta: item.tipo_falta ? item.tipo_falta : leyenda,
        tipoSancion: aux ,
        causaMotivoHechos: item.causa_motivo_hechos,
        acto: item.acto ? item.acto : leyenda,
        responsableSancion:{
            nombres: item.responsable.nombres ? item.responsable.nombres : leyenda,
            primerApellido: item.responsable.primer_apellido ? item.responsable.primer_apellido : leyenda,
            segundoApellido: item.responsable.segundo_apellido ? item.responsable.segundo_apellido : leyenda
        },
        resolucion : {
            sentido : item.resolucion.sentido ? item.resolucion.sentido : leyenda,
            url : item.resolucion.url ? item.resolucion.url : leyenda,
            fechaNotificacion: item.resolucion.fechaNotificacion ? item.resolucion.fechaNotificacion : leyenda
        },
        multa : item.multa? {
            monto: item.multa.monto ? item.multa.monto : "-",
            moneda: item.multa.moneda ? {clave:item.multa.moneda, valor: leyenda} : leyenda
        } : leyenda,
        inhabilitacion : item.plazo ? {
            plazo: leyenda,
            fechaInicial: item.plazo.fecha_inicial ? item.plazo.fecha_inicial : '-',
            fechaFinal: item.plazo.fecha_final ? item.plazo.fecha_final : '-'
        } : leyenda,
        observaciones : item.observaciones ? item.observaciones : leyenda
    }
}
module.exports = {
    rest,
    sfp
};