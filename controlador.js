

var app = angular.module('myApp', []);

app.controller('myCtrl', function ($scope) {


$scope.producto = {};
var formatoFechaMysql = "YYYY-MM-DD";
$scope.calendarioDeReembolsos = [];

$scope.tarjeta = {};

tarjeta.dia_de_corte
tarjeta.ultimo_dia_de_pago

function generarPeriodoActual (corte, pago) {
  let dia_de_corte = convertirCadenaAEntero(corte);
  let ultimo_dia_de_pago = convertirCadenaAEntero(pago);

}



$scope.generar = function () {
var parametros = obtenerParametrosDelFormularioODeUnArreglo(false);
$scope.calendarioDeReembolsos = generarCalendarioDeReembolsos(parametros);
console.log($scope.calendarioDeReembolsos);
var folio = convertirCadenaAEntero($scope.producto.folio);
var arregloConFolioAgregado = agregarFolioAlCalendario($scope.calendarioDeReembolsos,folio);
$scope.matrizAnidadaParaInsercion = convertirAMatrizAnidada(arregloConFolioAgregado);

};//termina la funcion genrar
//--------------------------------------------------------------------

$scope.generarDesdeConsulta = function (parametros) {
//$scope.producto.consultaDeLaBase;


};//termina la funcion generarDesdeConsulta
//--------------------------------------------------------------------

$scope.uno = function () {
var arregloFinal = generarMultiplesCalendarios();
var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(arregloFinal));
var dlAnchorElem = document.getElementById('downloadAnchorElem');
dlAnchorElem.setAttribute("href",     dataStr     );
dlAnchorElem.setAttribute("download", "scene.json");
dlAnchorElem.click();
//Cuerpo
};//termina la funcion uno
//--------------------------------------------------------------------

function arrayToCSV (twoDiArray) {
    //  Modified from: http://stackoverflow.com/questions/17836273/
    //  export-javascript-data-to-csv-file-without-server-interaction
    var csvRows = [];
    for (var i = 0; i < twoDiArray.length; ++i) {
        for (var j = 0; j < twoDiArray[i].length; ++j) {
            twoDiArray[i][j] = '\"' + twoDiArray[i][j] + '\"';  // Handle elements that contain commas
        }
        csvRows.push(twoDiArray[i].join(','));
    }

    var csvString = csvRows.join('\r\n');
    var a         = document.createElement('a');
    a.href        = 'data:attachment/csv,' + csvString;
    a.target      = '_blank';
    a.download    = 'myFile.csv';

    document.body.appendChild(a);
    a.click();
    // Optional: Remove <a> from <body> after done
}


function convertirCadenaAEntero (cadena) {
	var x = parseInt(cadena, 10); // you want to use radix 10
	return x;
}

function generarCalendarioDeReembolsos (objeto) {
//var producto = extraerDatosDelProducto(objeto);
//var capital = extraerCapital(objeto);
//var diasDeCobro = [producto.dom,producto.lun,producto.mar,producto.mie,producto.jue,producto.vie,producto.sab];
var id_credito = objeto.id_credito;
//var capital = (objeto.capital); 
var capital = parseInt(objeto.capital, 10);
var diasDeCobro = [0,1,1,1,1,1,1];
var numeroDePagos = objeto.numeroDePagos;
var periodoDePagoEnDias = objeto.periodoDePagoEnDias;
var diasParaVencimiento = objeto.diasParaVencimiento;
var tasaDeInteres = objeto.tasaDeInteres;

var cuotaDeReembolso = 0;
var calendarioPagos = [];

//solamente para generar calendarios
//fecha1 es un control en la vista para generar el calendario en cualquier fecha 
//var fechaDeVencimiento = moment($scope.fechas.fecha1);
//var fechaCalendario = moment($scope.fechas.fecha1);
//var fechaDeVencimiento = moment($scope.fechaDeTrabajoParaContratos);
//var fechaCalendario = moment($scope.fechaDeTrabajoParaContratos);

var fechaDeVencimiento = objeto.fechaDeVencimiento;
var fechaCalendario = objeto.fechaCalendario;
//-----------------------------------------------------------------------------
var diaDeLaSemanaEnNum = 0;

var capitalDeCuota = 0;
var interesDeCuota = 0;
var saldoAcumulado = 0;
var saldoTotal = 0;
var acumuladorParaNumDePago = 1;//Inicia en pago 1
//fechaCalendario = encontrarPrimeraFechaDePagoValida(objeto);
fechaCalendario = encontrarPrimeraFechaDePagoValida(diasDeCobro,fechaDeVencimiento);
fechaDeVencimiento = obtenerFechaDeVencimientoDeUnPago(fechaCalendario,diasParaVencimiento,diasDeCobro);
cuotaDeReembolso = calcularCuotasDeReembolso(capital,numeroDePagos,tasaDeInteres);
capitalDeCuota = calcularCapitalPorCuota(capital,numeroDePagos);
interesDeCuota = calcularInteresPorCuota(capital,tasaDeInteres,numeroDePagos);
saldoAcumulado = saldoAcumulado + cuotaDeReembolso;//Restamos la primera cuota
saldoTotal = calcularSaldoRestante(capital,tasaDeInteres,saldoAcumulado);
calendarioPagos.push({'id_calendario_de_pago':"(" + null,'id_credito':id_credito,
                      'numero_de_pago':acumuladorParaNumDePago,'fecha_de_pago':fechaCalendario,'fecha_de_vencimiento':fechaDeVencimiento,
                      'cuota_de_reembolso':cuotaDeReembolso,'capital_de_cuota':capitalDeCuota,'interes_de_cuota':interesDeCuota,
                      'saldo_total':saldoTotal+"),"
                    });
numeroDePagos--;
//hasta qui se habra generado la primera fecha de pago
for (var i = 0; i < numeroDePagos; i++) {
fechaCalendario = fechaCalendario.clone().add(periodoDePagoEnDias,'days');//sumamos el periodo de pago
diaDeLaSemanaEnNum = fechaCalendario.day();
//Si existe un dia que no se cobre
  while ( esDiaDeCobro(diasDeCobro,diaDeLaSemanaEnNum) == false ){
      fechaCalendario = fechaCalendario.add(1,'days');
      diaDeLaSemanaEnNum = fechaCalendario.day();
  };//termina while
  acumuladorParaNumDePago++;
  fechaDeVencimiento = obtenerFechaDeVencimientoDeUnPago(fechaCalendario,diasParaVencimiento,diasDeCobro);
  saldoAcumulado = saldoAcumulado + cuotaDeReembolso;
  saldoTotal = calcularSaldoRestante(capital,tasaDeInteres,saldoAcumulado);
  calendarioPagos.push({'id_calendario_de_pago': "(" + null,'id_credito':id_credito,
                        'numero_de_pago':acumuladorParaNumDePago,'fecha_de_pago':fechaCalendario,'fecha_de_vencimiento':fechaDeVencimiento,
                        'cuota_de_reembolso':cuotaDeReembolso,'capital_de_cuota':capitalDeCuota,'interes_de_cuota':interesDeCuota,
                        'saldo_total':saldoTotal +")," });
};
//return calendarioPagos;
var respuesta = convertirLasFechasAFormatoMysql(calendarioPagos); 
return respuesta;
}//Termina funcion generarCalendarioDeReembolsos
//---------------------------------------------------------------------------------------------------------------

function convertirLasFechasAFormatoMysql (arregloTipoObjeto) {
  for (var i = 0; i < arregloTipoObjeto.length; i++) {
    arregloTipoObjeto[i].fecha_de_pago = "'" + moment(arregloTipoObjeto[i].fecha_de_pago).format(formatoFechaMysql) + "'" ;
    arregloTipoObjeto[i].fecha_de_vencimiento = "'" + moment(arregloTipoObjeto[i].fecha_de_vencimiento).format(formatoFechaMysql) + "'";
  };
  return arregloTipoObjeto;
}
//---------------------------------------------------------------------------------------------------------------


function convertirAMatrizAnidada (arregloTipoObjeto) {
var matrizAnidada = [];
for (var i = 0; i < arregloTipoObjeto.length; i++) {
  matrizAnidada.push( [ arregloTipoObjeto[i].id_calendario_de_pago,arregloTipoObjeto[i].id_credito,arregloTipoObjeto[i].numero_de_pago,
    moment(arregloTipoObjeto[i].fecha_de_pago).format(formatoFechaMysql),moment(arregloTipoObjeto[i].fecha_de_vencimiento).format(formatoFechaMysql),
    arregloTipoObjeto[i].cuota_de_reembolso,arregloTipoObjeto[i].capital_de_cuota,arregloTipoObjeto[i].interes_de_cuota,
    arregloTipoObjeto[i].saldo_total ] );
};
return matrizAnidada;
}//Termina la funcion convertirAMatrizAnidada
//-------------------------------------------------------------------------------------------------------------------------





function encontrarPrimeraFechaDePagoValida (diasDeCobro,fechaDeVencimiento) {
  var primeraFechaDePagoValida = moment(fechaDeVencimiento);
  //var producto = extraerDatosDelProducto(objeto);
  //var diasDeCobro = [producto.dom,producto.lun,producto.mar,producto.mie,producto.jue,producto.vie,producto.sab];
  var diasDeCobro = diasDeCobro;
  var fechaCalendario = moment(fechaDeVencimiento);
  var diaDeLaSemanaEnNum = 0;

  fechaCalendario = fechaCalendario.add(1,'days');
  diaDeLaSemanaEnNum = fechaCalendario.day();//Obtenemos el dia de la semana 0-6
  if (esDiaDeCobro(diasDeCobro,diaDeLaSemanaEnNum) == true) { //ES una fecha valido para su 1er pago?
  primeraFechaDePagoValida = fechaCalendario;
  } else{
  //Sumale un dia hasta que sea una fecha valida para su 1er pago
    while ( esDiaDeCobro(diasDeCobro,diaDeLaSemanaEnNum) == false ){
          fechaCalendario = fechaCalendario.add(1,'days');
          diaDeLaSemanaEnNum = fechaCalendario.day();
    };//termina while
  primeraFechaDePagoValida = fechaCalendario;
  };
return primeraFechaDePagoValida;
}//Termina la funcion encontrarPrimeraFechaDePagoValida
//---------------------------------------------------------------------------------------------------------------
function extraerDatosDelProducto (objeto) {
  var producto = [];
  // El arreglo de objs. no tiene indices, por lo cual debemos iterar y generarlo
  for(let i = 0; i < objeto.length; i++){
    let subArreglo = objeto[i]; 
    if (subArreglo.producto) { producto = subArreglo.producto; };
  }
  return producto;
}//Termina la funcion extraerDatosDelProducto
//---------------------------------------------------------------------------------------------------------------
function extraerCapital (objeto) {
   var respuesta = [];
  // El arreglo de objs. no tiene indices, por lo cual debemos iterar y generarlo
  for(let i = 0; i < objeto.length; i++){
    let subArreglo = objeto[i]; 
    if (subArreglo.monto) { respuesta = subArreglo.monto; };
  }
  return respuesta;
}//Termina la funcion extraerCapital
//---------------------------------------------------------------------------------------------------------------

function obtenerFechaDeVencimientoDeUnPago (fechaRecibida,dias,diasDeCobro) {
var numeroDiasParaVencimiento = dias;
var fechaDeVencimiento = fechaRecibida.clone().add(numeroDiasParaVencimiento, 'days');
var diaDeLaSemanaEnNum = fechaDeVencimiento.day();
//Si existe un dia que no se cobre
  while ( esDiaDeCobro(diasDeCobro,diaDeLaSemanaEnNum) == false ){
      fechaDeVencimiento = fechaDeVencimiento.add(1,'days');
      diaDeLaSemanaEnNum = fechaDeVencimiento.day();
  };//termina while
return fechaDeVencimiento;
}//termina la funcion genererFechaDeVencimientoDeUnPago
//---------------------------------------------------------------------------------------------------------------

function calcularSaldoRestante (capital,tasaDeInteres,montoReembolsado) {
  var interes = capital * (tasaDeInteres/100);
  var saldoTotal = capital + interes;
  var saldoRestante = saldoTotal - montoReembolsado;
  return saldoRestante;
}// Termina funcion calcularSaldoRestante
//---------------------------------------------------------------------------------------------------------------

function calcularInteresPorCuota (capital,tasaInteres,numeroDepagos) {
  var interesDeCuota = (capital * ( tasaInteres/100 )) / numeroDepagos;
  var result = Math.round( interesDeCuota * 100 ) / 100;//redondeo a 2 decimales
  // return Math.round(interesDeCuota);
  return result;
}//Termina funcion calcularInteresCuota 
//----------------------------------------------------------------------------------------------------------------

function calcularCapitalPorCuota (capital,numeroDePagos) {
  var capitalDeCuota = capital / numeroDePagos;
  var result = Math.round( capitalDeCuota * 100 ) / 100;//redondeo a 2 decimales
  // return Math.round(capitalDeCuota);
  return result;
}//Termina la funcion calcularCapitalCuota 
//----------------------------------------------------------------------------------------------------------------

function calcularCuotasDeReembolso (capitalRecibido,numPagos,tasaInteres) {
var capital = capitalRecibido;
var numeroDePagos = numPagos;
var tasaDeInteres = tasaInteres;
var tantoPorCientoDeInteres = tasaDeInteres / 100;
var interesDelCapital = capital * tantoPorCientoDeInteres;
var resultado = (capital + interesDelCapital) / numeroDePagos;
return resultado; //la cuota debe ser exacta no redondeos
}//Termina funcion calcularCuotasDeReembolso
//----------------------------------------------------------------------------------------------------------------

//dom 0,lun 1, mar 2, mie 3, jue 4, vie 5 sab 6
function esDiaDeCobro (diasDeCobro,dia) {
if (diasDeCobro[dia] == 1 ) { return true; } else { return false; };
}//Termina funcion esDiaDeCobro ----------------------------------------------------------------------------------------



function agregarFolioAlCalendario (arregloTipoObjeto,folio) {
  var arregloConFolioAgregado = arregloTipoObjeto;
  for (let i = 0; i < arregloConFolioAgregado.length; i++) {
    arregloConFolioAgregado[i].id_credito = folio;
  };
  return arregloConFolioAgregado;
}//Termina funcion agregarFolioAlCalendario
//-------------------------------------------------------------------------------------------------------------------------
function convertirAMatrizAnidada (arregloTipoObjeto) {
var matrizAnidada = [];
for (var i = 0; i < arregloTipoObjeto.length; i++) {
  matrizAnidada.push( [ arregloTipoObjeto[i].id_calendario_de_pago,arregloTipoObjeto[i].id_credito,arregloTipoObjeto[i].numero_de_pago,
    moment(arregloTipoObjeto[i].fecha_de_pago).format(formatoFechaMysql),moment(arregloTipoObjeto[i].fecha_de_vencimiento).format(formatoFechaMysql),
    arregloTipoObjeto[i].cuota_de_reembolso,arregloTipoObjeto[i].capital_de_cuota,arregloTipoObjeto[i].interes_de_cuota,
    arregloTipoObjeto[i].saldo_total ] );
};
return matrizAnidada;
}//Termina la funcion convertirAMatrizAnidada
//-------------------------------------------------------------------------------------------------------------------------





function obtenerParametrosDelFormularioODeUnArreglo (bandera,arreglo) {
  var esUnArreglo = bandera;
  var parametros = {};

  var capital = 0;
  var numeroDePagos = 0;
  var periodoDePagoEnDias = 0;
  var diasParaVencimiento = 0;
  var tasaDeInteres = 0;
  var fechaDeVencimiento = 0;
  var fechaCalendario = 0;

  if (esUnArreglo) {
    let indice = 0;
    id_credito = convertirCadenaAEntero(arreglo[indice]); indice++;
    capital = convertirCadenaAEntero(arreglo[indice]); indice++;
    numeroDePagos = convertirCadenaAEntero(arreglo[indice]); indice++;
    periodoDePagoEnDias = convertirCadenaAEntero(arreglo[indice]); indice++;
    diasParaVencimiento = convertirCadenaAEntero(arreglo[indice]); indice++;
    tasaDeInteres = convertirCadenaAEntero(arreglo[indice]); indice++;
    fechaDeVencimiento = moment(arreglo[indice]).format(formatoFechaMysql); 
    fechaCalendario = moment(arreglo[indice]).format(formatoFechaMysql);
    parametros = {id_credito:id_credito,capital:capital,numeroDePagos:numeroDePagos,periodoDePagoEnDias:periodoDePagoEnDias,
                  diasParaVencimiento:diasParaVencimiento,tasaDeInteres:tasaDeInteres,fechaDeVencimiento:fechaDeVencimiento,
                  fechaCalendario:fechaCalendario};
  } else{
    //tomar valores del Formulario
    id_credito = convertirCadenaAEntero($scope.producto.folio);
    capital = convertirCadenaAEntero($scope.producto.capital);
    numeroDePagos = convertirCadenaAEntero($scope.producto.numero_de_pagos);
    periodoDePagoEnDias = convertirCadenaAEntero($scope.producto.periodo_de_pago_en_dias);
    diasParaVencimiento = convertirCadenaAEntero($scope.producto.num_dias_para_vencimiento);
    tasaDeInteres = convertirCadenaAEntero($scope.producto.tasa_interes);
    fechaDeVencimiento = moment($scope.producto.fecha_inicio).format(formatoFechaMysql);
    fechaCalendario = moment($scope.producto.fecha_inicio).format(formatoFechaMysql);
    parametros = {id_credito:id_credito,capital:capital,numeroDePagos:numeroDePagos,periodoDePagoEnDias:periodoDePagoEnDias,
                  diasParaVencimiento:diasParaVencimiento,tasaDeInteres:tasaDeInteres,fechaDeVencimiento:fechaDeVencimiento,
                  fechaCalendario:fechaCalendario};
  };
  return parametros;
}


//--------------------------------------------------------------------------------------------------------------------------
//                                    Seccion para multiples 
//-------------------------------------------------------------------------------------------------------------------------


function generarMultiplesCalendarios () {
  var arregloDeCreditos = CSVToArray($scope.producto.multiplesCreditos, "," );
  var parametrosParaUnCalendarioIndividual = 0;
  var para = 0;
  var calendarioDeUnFolio = 0;
  var calendariosDeMultiplesFolios = [];
  for (let i = 0; i < arregloDeCreditos.length; i++) {
    parametrosParaUnCalendarioIndividual = arregloDeCreditos[i];
    para = obtenerParametrosDelFormularioODeUnArreglo(true,parametrosParaUnCalendarioIndividual);
    calendarioDeUnFolio = generarCalendarioDeReembolsos(para);
    //$scope.calendarioDeReembolsos = $scope.calendarioDeReembolsos.concat(calendarioDeUnFolio);
    calendariosDeMultiplesFolios = calendariosDeMultiplesFolios.concat(calendarioDeUnFolio);
  };
  return calendariosDeMultiplesFolios;
}














function CSVToArray( strData, strDelimiter ){
  strDelimiter = (strDelimiter || ",");
  var objPattern = new RegExp(
  (
  "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
  "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
  "([^\"\\" + strDelimiter + "\\r\\n]*))"
  ),
  "gi"
  );
  var arrData = [[]];
  var arrMatches = null;
  while (arrMatches = objPattern.exec( strData )){
  var strMatchedDelimiter = arrMatches[ 1 ];
  if (
  strMatchedDelimiter.length &&
  (strMatchedDelimiter != strDelimiter)
  ){
  arrData.push( [] );
  }
  if (arrMatches[ 2 ]){
  var strMatchedValue = arrMatches[ 2 ].replace(
      new RegExp( "\"\"", "g" ),
      "\""
      );
  } else {
  var strMatchedValue = arrMatches[ 3 ];
  }
  arrData[ arrData.length - 1 ].push( strMatchedValue );
  }
  return( arrData );
}



});//termina controlador