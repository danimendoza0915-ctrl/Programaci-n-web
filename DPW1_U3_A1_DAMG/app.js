/*Se estable la lista de los 5 dispositivos con su informacion */
let dispositivos = [
    {
        id: 1,
        nombre: "Smart Hub",
        descripcionCorta: "Este es un distivo sirve como un medio de control central para la gestión de dispositivos inteligentes.",
        precio: 3000, stock: 100,
        ruta_imagen: "Imagenes/SmartHub.jpg"
    },
    {
        id: 2,
        nombre: "Camara 4k",
        descripcionCorta: "Es una camara de seguridad que permite poder tener vigilancia 24/7 con resolución 4k",
        precio: 4000, stock: 150, ruta_imagen: "Imagenes/Camara 4k.jpg"
    },
    {
        id: 3,
        nombre: "Cerradura biometrica",
        descripcionCorta: "Es una cerradura para el hogar con la mejor seguridad, la cual cuenta con huella digital",
        precio: 2500, stock: 90, ruta_imagen: "Imagenes/cerradura.jpg"
    },
    {
        id: 4,
        nombre: "Sensor inteligente",
        descripcionCorta: "Es un sensor el cual detecta moviento para activar ciertas opciones configuradas por parte del usuario",
        precio: 3500, stock: 80, ruta_imagen: "Imagenes/sensor inteligente.jpg"
    },
    {
        id: 5,
        nombre: "Asistente de voz",
        descripcionCorta: "Nos permite pdoer controlar funciopnes medinate el uso de comanos de voz",
        precio: 1500, stock: 150, ruta_imagen: "Imagenes/Asistente voz.jpg"
    }
];

/*Este es el indice del producto visible actualmente dentro de la pantalla*/
let ProductoActual = 0;
/*Esta es la candiad de unidades seleccionadas por el usuario */
let cantidad = 1;
/* Esta variable nos permite poder controlar el cambio de forma automatica de los productos*/
let indiceA = 0;

/*Nos muestra en pantalla los datos del producto segun el incide recibido como a su vez se agrega una animacion
dentro de la cual se reinica al momneto de cambiar el producto */
function cargarProducto(indice) {
    ProductoActual = indice;

    document.getElementById("nombre").innerHTML = dispositivos[indice].nombre;
    document.getElementById("descripcion").innerHTML = dispositivos[indice].descripcionCorta;
    document.getElementById("precio").innerHTML = "$" + dispositivos[indice].precio;

    let imagen = document.getElementById("ImagenPrincipal");
    imagen.classList.add("animacion");
    imagen.src = dispositivos[indice].ruta_imagen;

    setTimeout(function () { imagen.classList.remove("animacion"); }, 400)
    cantidad = 1;

    document.getElementById("cantidad").innerHTML = cantidad;
}

/*Nos permite poder mostrar el stock quee sta disponible al momento de pasar el cursor sobre el boton*/
function MostrarStock() {
    var mensaje = document.getElementById("mensajeStock");mensaje.innerHTML = "Disponibilidad inmediata: " +
        dispositivos[ProductoActual].stock + " unidades"; mensaje.style.display ="block";
}

/*Nos perrmite poder ocultar el mensaje de stock al momento de retirar el cursor*/

function OcultarStock() {
    var mensaje = document.getElementById("mensajeStock"); mensaje.style.display ="none";
}

/*Nos permite del lado del boton sumar unidades sin pasar del limite del stock*/
function Aumentar() {
    if (cantidad < dispositivos[ProductoActual].stock) {
        cantidad++;
        document.getElementById("cantidad").innerHTML = cantidad;
    }
}

/*Nos permite del lado del boton restar unidades sin pasar del limite de 1*/
function Disminuir() {
    if (cantidad > 1) {
        cantidad--;
        document.getElementById("cantidad").innerHTML = cantidad;
    }
}
/*Se agrega al carrito y se calcula el total y muestra la notificación de la confirmacion*/

function AgregarAlCarrito() {
    let producto = dispositivos[ProductoActual];
    let total = cantidad * producto.precio;
    let toast = document.getElementById("toast")

    toast.innerHTML = "Confirmación: Se han reservado " + cantidad + " unidades de " +
        producto.nombre + ". Total: $" + total;

    toast.style.display = "block";

    setTimeout(function () {
        toast.style.display = "none";
    }, 10000);
}
/*Permite que se cambie de forma automatica los productos cada 60 segundos */

function CicloAutomatico() {
    indiceA++;
    if (indiceA >= dispositivos.length) {
        indiceA = 0;
    }
    cargarProducto(indiceA)
}
setInterval(CicloAutomatico, 60000)