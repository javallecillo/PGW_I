function crearCard(producto) {
    // Nueva ruta de la imagen del juego según la plataforma
    const imagenJuego = `img/${producto.plataforma}/${producto.nombre}.jpg`;
    const imagenPlataforma = `img/${producto.plataforma}/${producto.plataforma}.png`;

    return `
    <div class="col-xs-12 col-sm-6 col-md-3">
        <div class="thumbnail card-videojuego">
            <img src="${imagenJuego}" alt="${producto.nombre}">
            <div class="caption">
                <h2 class="titulo-juego">${producto.nombre}</h2>
                <div class="info-juego">
                    <span class="categoria-juego">${producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}</span>
                    <img class="icono-plataforma-img" src="${imagenPlataforma}" alt="${producto.plataforma}" title="${producto.plataforma}">
                </div>
                <p class="precio-juego">L. ${producto.precio.toFixed(2)}</p>
                <div class="btn-group">
                    <a href="#" class="btn btn-vermas"><i class="fa-solid fa-eye"></i> Ver más</a>
                    <a href="#" class="btn btn-agregar"><i class="fa-solid fa-cart-plus"></i> Agregar</a>
                </div>
            </div>
        </div>
    </div>
    `;
}

function cargarProductos() {
    fetch('json/productos.json')
        .then(response => response.json())
        .then(data => {
            // Limpia los contenedores
            document.querySelector('#ofertas-container > div').innerHTML = '';
            document.querySelector('#biblioteca-container > div').innerHTML = '';
            document.querySelector('#populares-container > div').innerHTML = '';

            // Ofertas: productos con precio menor a 1200
            const ofertas = data.productos.filter(p => p.precio < 1200);
            ofertas.forEach(producto => {
                document.querySelector('#ofertas-container > div').innerHTML += crearCard(producto);
            });

            // Biblioteca: todos los productos
            data.productos.forEach(producto => {
                document.querySelector('#biblioteca-container > div').innerHTML += crearCard(producto);
            });

            // Populares: productos con populares=true
            const populares = data.productos.filter(p => p.populares);
            populares.forEach(producto => {
                document.querySelector('#populares-container > div').innerHTML += crearCard(producto);
            });
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
        });
}

document.addEventListener('DOMContentLoaded', cargarProductos);