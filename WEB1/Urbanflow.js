/* =========================================================
   urbanflow.js
   Archivo externo de JavaScript - UrbanFlow Dashboard
   Parte 2 - Programación Web 1 - UnADM
   ========================================================= */


/* =========================================================
   b. ARRAY DE REPARTIDORES (BASE DE DATOS SIMULADA)
   Declaración de variables de flota: cada objeto representa
   un repartidor/vehículo activo en el sistema.
   ========================================================= */
var flota = [
    {
        id: 1,                              /* i.   identificador único */
        nombre: "Carlos M.",
        tipo_transporte: "Moto",            /* ii.  tipo de vehículo */
        estatus: "Disponible",              /* iii. estado actual */
        capacidad_carga: 3,                 /* iv.  escala 1-5 */
        coordenadas_gps: [19.415, -99.155], /* v.   [lat, lng] CDMX */
        destino_gps: null
    },
    {
        id: 2,
        nombre: "Laura G.",
        tipo_transporte: "Bicicleta",
        estatus: "Disponible",
        capacidad_carga: 1,
        coordenadas_gps: [19.455, -99.150],
        destino_gps: null
    },
    {
        id: 3,
        nombre: "Pedro R.",
        tipo_transporte: "Van",
        estatus: "Disponible",
        capacidad_carga: 5,
        coordenadas_gps: [19.420, -99.115],
        destino_gps: null
    },
    {
        id: 4,
        nombre: "Ana S.",
        tipo_transporte: "Moto",
        estatus: "Disponible",
        capacidad_carga: 3,
        coordenadas_gps: [19.440, -99.148],
        destino_gps: null
    }
];


/* =========================================================
   ARRAY DE PEDIDOS
   Cada pedido tiene su propio estatus y repartidor asignado.
   pedidoActivoIdx guarda el índice del pedido activo actual
   para que cambiarFase() sepa cuál actualizar.
   ========================================================= */
var pedidos = [
    { id: "0100", destino: "Lomas Altas", prioridad: "Flash", estatus: "Pendiente", peso: 2, repartidor: null },
    { id: "0120", destino: "Palo Alto", prioridad: "Estandar", estatus: "Pendiente", peso: 1, repartidor: null },
    { id: "0150", destino: "Coyoacán", prioridad: "Programado", estatus: "Pendiente", peso: 3, repartidor: null }
];

/* Índice del pedido que está activo en el panel de información */
var pedidoActivoIdx = null;


/* =========================================================
   SECUENCIA DE FASES DEL PEDIDO
   ========================================================= */
var fases = ["Asignado", "Recolectado en Hub", "En camino", "Entregado"];


/* =========================================================
   LÍMITES DEL MAPA y HUB CENTRAL
   Se usan para la lógica de geocodificación.
   ========================================================= */
var limites = {
    minLat: 19.41,
    maxLat: 19.46,
    minLng: -99.16,
    maxLng: -99.11
};

var hubGps = [19.433, -99.133];


/* =========================================================
   FUNCIÓN gpsAPunto(coords)
   Lógica de geocodificación: convierte [lat, lng]
   a porcentaje {x, y} dentro del contenedor del mapa.
   ========================================================= */
function gpsAPunto(coords) {
    var lat = coords[0];
    var lng = coords[1];

    var x = ((lng - limites.minLng) / (limites.maxLng - limites.minLng)) * 100;
    var y = ((limites.maxLat - lat) / (limites.maxLat - limites.minLat)) * 100;

    x = Math.max(2, Math.min(96, x));
    y = Math.max(2, Math.min(96, y));

    return { x: x, y: y };
}


/* =========================================================
   c. FUNCIÓN despacharPedido()
   Busca el siguiente pedido pendiente y lo asigna al
   repartidor más cercano y disponible con capacidad suficiente.
   Permite despachar todos los pedidos uno por uno.
   ========================================================= */
function despacharPedido() {

    /* Buscar el siguiente pedido con estatus "Pendiente" */
    var pedido = null;
    var idx = null;
    for (var i = 0; i < pedidos.length; i++) {
        if (pedidos[i].estatus === "Pendiente") {
            pedido = pedidos[i];
            idx = i;
            break;
        }
    }

    if (!pedido) {
        alert("Todos los pedidos ya fueron despachados.");
        return;
    }

    /* ----------------------------------------------------------
       i. Lógica de geocodificación: calcular distancia GPS
       entre el hub y cada repartidor disponible.
       ---------------------------------------------------------- */
    var seleccionado = null;
    var menorDistancia = Infinity;

    for (var j = 0; j < flota.length; j++) {
        var rep = flota[j];

        if (rep.estatus !== "Disponible") continue;
        if (rep.capacidad_carga < pedido.peso) continue;

        var dLat = rep.coordenadas_gps[0] - hubGps[0];
        var dLng = rep.coordenadas_gps[1] - hubGps[1];
        var distancia = Math.sqrt(dLat * dLat + dLng * dLng);

        if (distancia < menorDistancia) {
            menorDistancia = distancia;
            seleccionado = rep;
        }
    }

    if (!seleccionado) {
        alert("No hay repartidores disponibles para este pedido.");
        return;
    }

    /* ----------------------------------------------------------
       ii. Cambiar estatus del repartidor a "Asignado"
       ---------------------------------------------------------- */
    seleccionado.estatus = "Asignado";
    seleccionado.destino_gps = [
        hubGps[0] + (Math.random() - 0.5) * 0.04,
        hubGps[1] + (Math.random() - 0.5) * 0.04
    ];

    /* Actualizar el pedido con su repartidor y nuevo estatus */
    pedido.estatus = "Asignado";
    pedido.repartidor = seleccionado;
    pedidoActivoIdx = idx;

    /* ----------------------------------------------------------
       iii. Imprimir itinerario en consola
       ---------------------------------------------------------- */
    console.log("=== ITINERARIO DEL PEDIDO ===");
    console.log("Pedido:     " + pedido.id + " -> " + pedido.destino);
    console.log("Repartidor: " + seleccionado.nombre + " (" + seleccionado.tipo_transporte + ")");
    console.log("GPS:        [" + seleccionado.coordenadas_gps + "]");
    console.log("Ruta:       Hub Central -> " + pedido.destino);
    console.log("=============================");

    /* iii. Trazar ruta y actualizar todo el DOM */
    renderRutas();
    renderVehiculos();
    actualizarPanelInfo();
    renderTabla();
    actualizarKPIs();

    alert("Pedido " + pedido.id + " asignado a " + seleccionado.nombre);
}


/* =========================================================
   FUNCIÓN renderRutas()
   Actualización del DOM: dibuja las rutas activas en el SVG.
   ========================================================= */
function renderRutas() {

    var svg = document.getElementById("svg-rutas");
    svg.innerHTML = "";

    var hub = gpsAPunto(hubGps);

    for (var i = 0; i < flota.length; i++) {
        var rep = flota[i];

        if (!rep.destino_gps) continue;
        if (rep.estatus !== "Asignado" && rep.estatus !== "En camino") continue;

        var destino = gpsAPunto(rep.destino_gps);
        var color = rep.tipo_transporte === "Moto" ? "#ff4d4d" :
            rep.tipo_transporte === "Bicicleta" ? "#00e5a0" : "#f0a500";

        var linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
        linea.setAttribute("x1", hub.x + "%");
        linea.setAttribute("y1", hub.y + "%");
        linea.setAttribute("x2", destino.x + "%");
        linea.setAttribute("y2", destino.y + "%");
        linea.setAttribute("stroke", color);
        linea.setAttribute("stroke-width", "1.5");
        linea.setAttribute("stroke-dasharray", "5,3");
        linea.setAttribute("opacity", "0.8");
        svg.appendChild(linea);

        var punto = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        punto.setAttribute("cx", destino.x + "%");
        punto.setAttribute("cy", destino.y + "%");
        punto.setAttribute("r", "2");
        punto.setAttribute("fill", color);
        svg.appendChild(punto);
    }

    /* Punto del hub */
    var hubCirculo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hubCirculo.setAttribute("cx", hub.x + "%");
    hubCirculo.setAttribute("cy", hub.y + "%");
    hubCirculo.setAttribute("r", "4");
    hubCirculo.setAttribute("fill", "#00e5a0");
    svg.appendChild(hubCirculo);
}


/* =========================================================
   FUNCIÓN renderVehiculos()
   Actualización del DOM: posiciona los iconos de vehículos
   en el mapa usando geocodificación GPS -> porcentaje.
   ========================================================= */
function renderVehiculos() {

    var mapa = document.getElementById("map-container");

    var viejos = mapa.querySelectorAll(".vehiculo-js");
    for (var i = 0; i < viejos.length; i++) {
        viejos[i].remove();
    }

    for (var j = 0; j < flota.length; j++) {
        var rep = flota[j];
        var punto = gpsAPunto(rep.coordenadas_gps);

        var color = rep.tipo_transporte === "Moto" ? "#ff4d4d" :
            rep.tipo_transporte === "Bicicleta" ? "#00e5a0" : "#f0a500";

        var div = document.createElement("div");
        div.className = "vehiculo vehiculo-js";
        div.style.position = "absolute";
        div.style.left = punto.x + "%";
        div.style.top = punto.y + "%";
        div.style.transform = "translate(-50%, -50%)";
        div.style.textAlign = "center";
        div.style.fontSize = "9px";
        div.style.color = color;
        div.style.zIndex = "3";

        div.innerHTML =
            '<svg width="36" height="24" viewBox="0 0 100 60">' +
            '<circle cx="20" cy="44" r="12" fill="none" stroke="' + color + '" stroke-width="6"/>' +
            '<circle cx="80" cy="44" r="12" fill="none" stroke="' + color + '" stroke-width="6"/>' +
            '<rect x="30" y="22" width="40" height="16" fill="' + color + '"/>' +
            '</svg>' +
            '<div>' + rep.nombre + '</div>' +
            '<div style="font-size:8px; color:#8b949e">' + rep.estatus + '</div>';

        mapa.appendChild(div);
    }
}


/* =========================================================
   d. FUNCIÓN rastreoEnVivo()
   Mueve los repartidores activos cada 2 segundos y
   actualiza el mapa y los KPIs automáticamente.
   ========================================================= */
function rastreoEnVivo() {

    setInterval(function () {

        /* i. Mover repartidores activos hacia su destino */
        /* Mover repartidores activos hacia su destino */
        for (var i = 0; i < flota.length; i++) {

            var rep = flota[i];

            if (
                rep.estatus !== "Asignado" &&
                rep.estatus !== "Recolectado en Hub" &&
                rep.estatus !== "En camino"
            ) continue;

            if (!rep.destino_gps) continue;

            var paso = 0.001;

            var dLat = rep.destino_gps[0] - rep.coordenadas_gps[0];
            var dLng = rep.destino_gps[1] - rep.coordenadas_gps[1];

            rep.coordenadas_gps[0] += dLat > 0 ? paso : -paso;
            rep.coordenadas_gps[1] += dLng > 0 ? paso : -paso;
        }

        /* ii. Actualizar mapa, KPIs y panel */
        renderVehiculos();
        renderRutas();
        actualizarKPIs();
        actualizarPanelInfo();
        renderTabla();

    }, 2000);
}


/* =========================================================
   f. FUNCIÓN cambiarFase()
   onClick del botón "Cambio de Fase".
   Avanza el estatus del pedido activo Y del repartidor
   vinculado, luego actualiza la tabla y el panel.
   ========================================================= */
function cambiarFase() {

    if (pedidoActivoIdx === null) {
        alert("Primero despacha un pedido.");
        return;
    }

    var pedido = pedidos[pedidoActivoIdx];
    var rep = pedido.repartidor;

    /* Obtener índice de la fase actual */
    var idxFase = fases.indexOf(pedido.estatus);

    if (idxFase === -1 || pedido.estatus === "Entregado") {
        alert("El pedido ya fue entregado.");
        return;
    }

    /* Avanzar a la siguiente fase */
    var nuevaFase = fases[idxFase + 1];

    /* Actualizar estatus del PEDIDO */
    pedido.estatus = nuevaFase;

    /* Actualizar estatus del REPARTIDOR vinculado */
    if (rep) {
        if (nuevaFase === "Entregado") {
            rep.estatus = "Disponible";
            rep.destino_gps = null;
        } else {
            rep.estatus = nuevaFase;
        }
    }

    /* Actualizar el DOM: panel, tabla, mapa y KPIs */
    document.getElementById("estatus-actual").textContent = nuevaFase;
    renderTabla();
    renderVehiculos();
    renderRutas();
    actualizarKPIs();

    if (nuevaFase === "Entregado") {
        /* Resetear el panel para que quede listo para el siguiente pedido */
        pedidoActivoIdx = null;
        document.getElementById("btn-fase").disabled = false;
        document.getElementById("btn-fase").textContent = "Cambio de Fase ➜";
        document.getElementById("info-repartidor").textContent = "—";
        document.getElementById("info-vehiculo").textContent = "—";
        document.getElementById("info-eta").textContent = "—";
        document.getElementById("estatus-actual").textContent = "Sin asignar";
    }
}


/* =========================================================
   FUNCIÓN actualizarPanelInfo()
   Actualización del DOM: muestra los datos del pedido
   activo en el panel de información del envío.
   ========================================================= */
function actualizarPanelInfo() {

    if (pedidoActivoIdx === null) return;

    var pedido = pedidos[pedidoActivoIdx];
    var rep = pedido.repartidor;

    if (!rep) return;

    document.getElementById("info-repartidor").textContent = rep.nombre;
    document.getElementById("info-vehiculo").textContent = rep.tipo_transporte;
    document.getElementById("estatus-actual").textContent = pedido.estatus;

    /* Cálculo del ETA según distancia GPS al destino */
    if (rep.destino_gps) {
        var dLat = rep.destino_gps[0] - rep.coordenadas_gps[0];
        var dLng = rep.destino_gps[1] - rep.coordenadas_gps[1];
        var distancia = Math.sqrt(dLat * dLat + dLng * dLng);
        var factor = rep.tipo_transporte === "Van" ? 8000 :
            rep.tipo_transporte === "Moto" ? 6000 : 4000;
        document.getElementById("info-eta").textContent = (Math.round(distancia * factor) + 3) + " min";
    }
}


/* =========================================================
   FUNCIÓN actualizarKPIs()
   Actualización del DOM: recalcula los KPIs.
   ========================================================= */
function actualizarKPIs() {

    var activos = 0;
    for (var i = 0; i < flota.length; i++) {
        if (flota[i].estatus === "Asignado" || flota[i].estatus === "En camino") {
            activos++;
        }
    }

    document.getElementById("kpi-flota").textContent = Math.round((activos / flota.length) * 100) + "%";
    document.getElementById("kpi-pedidos").textContent = pedidos.filter(function (p) { return p.estatus === "Pendiente"; }).length;
    document.getElementById("kpi-tiempo").textContent = (20 + activos * 3) + " min";
}


/* =========================================================
   FUNCIÓN renderTabla()
   Actualización del DOM: genera las filas de la tabla
   reflejando el estatus actualizado de cada pedido.
   ========================================================= */
function renderTabla() {

    var tbody = document.getElementById("tabla-pedidos");
    tbody.innerHTML = "";

    for (var i = 0; i < pedidos.length; i++) {
        var p = pedidos[i];
        var clase = p.prioridad === "Flash" ? "flash" :
            p.prioridad === "Estandar" ? "estandar" : "programado";

        tbody.innerHTML +=
            "<tr>" +
            "<td>" + p.id + "</td>" +
            "<td>" + p.destino + "</td>" +
            "<td><span class='tag " + clase + "'>" + p.prioridad + "</span></td>" +
            "<td>" + p.estatus + "</td>" +
            "</tr>";
    }
}


/* =========================================================
   INICIO DE LA APLICACIÓN
   ========================================================= */
renderTabla();
renderVehiculos();
renderRutas();
actualizarKPIs();
rastreoEnVivo();