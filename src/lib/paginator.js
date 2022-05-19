//cantidad de resultados por página 
var pagi_cuantos = 1;
//cantidad de enlaces que se mostrarán como máximo en la barra de navegación 
var pagi_nav_num_enlaces = 3;
var pagi_actual = 0;
//definimos qué irá en el enlace a la página anterior 
var pagi_nav_anterior = " &laquo; Anterior ";
//definimos qué irá en el enlace a la página siguiente 
var pagi_nav_siguiente = " Siguiente &raquo; ";
//definimos qué irá en el enlace a la página siguiente 
var pagi_nav_primera = " &laquo; Primero ";
var pagi_nav_ultima = " Último &raquo; ";
var pagi_navegacion = null;
module.exports = {
    paginator(table, pagina, registros, action, host) {
        pagi_navegacion = "";
        pagi_cuantos = registros > 0 ? registros : pagi_cuantos;
        pagi_actual = pagina == undefined ? 1 : pagina;
        let pagi_totalReg = table.length;

        let pagi_totalPags = Math.ceil(pagi_totalReg / pagi_cuantos);
        if (pagi_actual != 1) {
            // Si no estamos en la página 1. Ponemos el enlace "primera" 
            let pagi_url = 1; //será el número de página al que enlazamos 
            pagi_navegacion += "<a class='btn btn-default' href='" + host + action
                + "?pagina=" + pagi_url + "&registros=" + pagi_cuantos + "'>" + pagi_nav_primera + "</a>";

            // Si no estamos en la página 1. Ponemos el enlace "anterior" 
            pagi_url = pagi_actual - 1; //será el número de página al que enlazamos 
            pagi_navegacion += "<a class='btn btn-default' href='" + host + action
                + "?pagina=" + pagi_url + "&registros=" + pagi_cuantos + "'>" + pagi_nav_anterior + " </a>";
        }
         // Si se definió la variable pagi_nav_num_enlaces 
        // Calculamos el intervalo para restar y sumar a partir de la página actual 
       
        let pagi_nav_intervalo = Math.round(pagi_nav_num_enlaces / 2);
        // Calculamos desde qué número de página se mostrará 
        let pagi_nav_desde = pagi_actual - pagi_nav_intervalo;
        // Calculamos hasta qué número de página se mostrará 
        let pagi_nav_hasta = pagi_actual + pagi_nav_intervalo;
        if (pagi_nav_desde < 1) {
            // Le sumamos la cantidad sobrante al final para mantener
            //el número de enlaces que se quiere mostrar.  
            pagi_nav_hasta -= (pagi_nav_desde - 1);
            // Establecemos pagi_nav_desde como 1. 
            pagi_nav_desde = 1;
        }
        // Si pagi_nav_hasta es un número mayor que el total de páginas 
        if (pagi_nav_hasta > pagi_totalPags){
             // Le restamos la cantidad excedida al comienzo para mantener 
            //el número de enlaces que se quiere mostrar. 
            pagi_nav_desde -= (pagi_nav_hasta - pagi_totalPags);
            // Establecemos pagi_nav_hasta como el total de páginas. 
            pagi_nav_hasta = pagi_totalPags;
            // Hacemos el último ajuste verificando que al cambiar pagi_nav_desde 
            //no haya quedado con un valor no válido. 
            if (pagi_nav_desde < 1) {
                pagi_nav_desde = 1;
            }
        }
        for (let pagi_i = pagi_nav_desde; pagi_i <= pagi_nav_hasta; pagi_i++){
             //Desde página 1 hasta última página (pagi_totalPags) 
             if (pagi_i == pagi_actual){
                  // Si el número de página es la actual (pagi_actual). Se escribe el número, pero sin enlace y en negrita. 
                pagi_navegacion += "<span class='btn btn-default' disabled='disabled'>" + pagi_i + "</span>";
             }else{
                 // Si es cualquier otro. Se escribe el enlace a dicho número de página. 
                pagi_navegacion += "<a class='btn btn-default' href='" + host
                + action + "?pagina=" + pagi_i + "&registros=" + pagi_cuantos + "'>"
                + pagi_i + " </a>";
             }
        }
        if (pagi_actual < pagi_totalPags){
             // Si no estamos en la última página. Ponemos el enlace "Siguiente" 
             var pagi_url = parseInt(pagi_actual, 10) + 1; //será el número de página al que enlazamos 
             pagi_navegacion += "<a class='btn btn-default' href='" + host + action
                     + "?pagina=" + pagi_url + "&registros=" + pagi_cuantos + "'>"
                     + pagi_nav_siguiente + "</a>";

                      // Si no estamos en la última página. Ponemos el enlace "Última" 
            pagi_url = pagi_totalPags; //será el número de página al que enlazamos 
            pagi_navegacion += "<a class='btn btn-default' href='" + host
                    + action + "?pagina=" + pagi_url + "&registros=" + pagi_cuantos + "'>"
                    + pagi_nav_ultima + "</a>";
        }
         /* Obtención de los registros que se mostrarán en la página actual. 
        *------------------------------------------------------------------------ 
         */
        // Calculamos desde qué registro se mostrará en esta página 
        // Recordemos que el conteo empieza desde CERO. 
        let pagi_inicial = (pagi_actual - 1) * pagi_cuantos;
         // Consulta SQL. Devuelve cantidad registros empezando desde pagi_inicial
         let query = table.slice(pagi_inicial,pagi_totalReg).slice(0,pagi_cuantos);
         let pagi_info = "<b>" + pagi_actual + "</b> al <b>" + pagi_totalPags + "</b> de <b>"+ pagi_totalReg + "</b> <b>/" + pagi_cuantos + "</b>";
        
         let data = {pagi_info,pagi_navegacion , query};
         return data;
    }
}