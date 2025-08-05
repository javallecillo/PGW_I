function crearCard(producto) {
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
                        <a href="#" class="btn btn-vermas" 
                           data-nombre="${producto.nombre}" 
                           data-categoria="${producto.categoria}" 
                           data-plataforma="${producto.plataforma}" 
                           data-precio="${producto.precio}">
                           <i class="fa-solid fa-eye"></i> Ver más
                        </a>
                        <a href="#" class="btn btn-agregar"><i class="fa-solid fa-cart-plus"></i> Agregar</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

let productosOrdenadosGlobal = []; // Guarda los productos ordenados para filtrar
let carrito = [];

// Función para agregar producto al carrito
function agregarAlCarrito(producto) {
    // Busca si ya existe el producto en el carrito (por nombre y plataforma)
    const existente = carrito.find(p => p.nombre === producto.nombre && p.plataforma === producto.plataforma);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({...producto, cantidad: 1});
    }
    actualizarCarritoModal();
}

// Evento para los botones de agregar al carrito (cards y modal)
document.addEventListener('click', function(e) {
    // Botón de las cards
    if (e.target.closest('.btn-agregar')) {
        e.preventDefault();
        const btn = e.target.closest('.btn-agregar');
        // Si está en el modal, busca los datos en el modal
        if (btn.id === "modalAgregarBtn") {
            const nombre = document.querySelector('#modalJuegoInfo h2').textContent;
            const categoria = document.querySelector('#modalJuegoInfo span').textContent.trim();
            const plataforma = document.querySelector('#modalJuegoInfo img.icono-plataforma-img').title;
            const precio = parseFloat(document.querySelector('#modalJuegoInfo p').textContent.replace('L.','').trim());
            agregarAlCarrito({nombre, categoria, plataforma, precio});
        } else {
            // Si está en la card
            const nombre = btn.getAttribute('data-nombre') || btn.closest('.card-videojuego').querySelector('.titulo-juego').textContent;
            const categoria = btn.getAttribute('data-categoria') || btn.closest('.card-videojuego').querySelector('.categoria-juego').textContent;
            const plataforma = btn.getAttribute('data-plataforma') || btn.closest('.card-videojuego').querySelector('.icono-plataforma-img').title;
            const precio = parseFloat(btn.getAttribute('data-precio')) || parseFloat(btn.closest('.card-videojuego').querySelector('.precio-juego').textContent.replace('L.','').trim());
            agregarAlCarrito({nombre, categoria, plataforma, precio});
        }
    }

    // Botón carrito en navbar (ahora el evento se activa en todo el botón)
    const carritoBtn = e.target.closest('.btn-carrito-navbar');
    if (carritoBtn) {
        e.preventDefault();
        actualizarCarritoModal();
        $('#modalCarrito').modal('show');
    }

    // Botón eliminar producto del carrito
    if (e.target.classList.contains('btn-eliminar-carrito')) {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        carrito.splice(idx, 1);
        actualizarCarritoModal();
    }

    // Oculta el menú en móvil al seleccionar consola o categoría
    if (window.innerWidth < 768) {
        if (
            e.target.classList.contains('filtro-consola') ||
            e.target.classList.contains('filtro-categoria') ||
            e.target.classList.contains('btn-inicio') ||
            e.target.classList.contains('btn-biblioteca') ||
            e.target.classList.contains('btn-ofertas') ||
            e.target.classList.contains('btn-populares')
        ) {
            $('.navbar-collapse').collapse('hide');
        }
    }
});

// Actualiza el contenido del modal del carrito
function actualizarCarritoModal() {
    const tbody = document.querySelector('#tablaCarrito tbody');
    tbody.innerHTML = '';
    let total = 0;
    carrito.forEach((p, idx) => {
        total += p.precio * p.cantidad;
        tbody.innerHTML += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.plataforma}</td>
                <td>${p.categoria}</td>
                <td>L. ${p.precio.toFixed(2)}</td>
                <td>${p.cantidad}</td>
                <td><button class="btn btn-danger btn-eliminar-carrito" data-idx="${idx}"><i class="fa fa-trash"></i></button></td>
            </tr>
        `;
    });
    document.getElementById('totalCarrito').textContent = `L. ${total.toFixed(2)}`;
}

function cargarProductos() {
    fetch('json/productos.json')
        .then(response => response.json())
        .then(data => {
            // Agrupa los productos por nombre
            const agrupados = {};
            data.productos.forEach(producto => {
                if (!agrupados[producto.nombre]) agrupados[producto.nombre] = [];
                agrupados[producto.nombre].push(producto);
            });

            // Ordena los nombres alfabéticamente
            const nombresOrdenados = Object.keys(agrupados).sort();

            // Genera el array ordenado por nombre y plataformas seguidas
            const productosOrdenados = [];
            nombresOrdenados.forEach(nombre => {
                // Opcional: puedes ordenar por plataforma si lo deseas
                agrupados[nombre].sort((a, b) => a.plataforma.localeCompare(b.plataforma));
                agrupados[nombre].forEach(prod => productosOrdenados.push(prod));
            });

            productosOrdenadosGlobal = productosOrdenados; // Guarda para filtrar después

            // Limpia los contenedores
            document.querySelector('#ofertas-container > div').innerHTML = '';
            document.querySelector('#biblioteca-container > div').innerHTML = '';
            document.querySelector('#populares-container > div').innerHTML = '';

            // Solo productos con oferta estrictamente igual a true
            const ofertas = productosOrdenados.filter(p => p.oferta === true);
            ofertas.forEach(producto => {
                document.querySelector('#ofertas-container > div').innerHTML += crearCard(producto);
            });

            // Biblioteca: todos los productos ordenados
            productosOrdenados.forEach(producto => {
                document.querySelector('#biblioteca-container > div').innerHTML += crearCard(producto);
            });

            // Populares: productos con populares=true
            const populares = productosOrdenados.filter(p => p.populares === true);
            populares.forEach(producto => {
                document.querySelector('#populares-container > div').innerHTML += crearCard(producto);
            });
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
        });
}

// Filtra y muestra los productos por consola
function filtrarPorConsola(consola) {
    // Cambia el título de la biblioteca
    document.querySelector('#biblioteca-container h2').textContent = `Juegos para ${consola}`;

    // Limpia el contenedor de biblioteca
    document.querySelector('#biblioteca-container > div').innerHTML = '';

    // Filtra los productos por plataforma
    const filtrados = productosOrdenadosGlobal.filter(p => p.plataforma === consola);

    // Muestra solo los filtrados
    filtrados.forEach(producto => {
        document.querySelector('#biblioteca-container > div').innerHTML += crearCard(producto);
    });

    // Opcional: oculta las secciones de ofertas y populares
    document.getElementById('ofertas-container').style.display = 'none';
    document.getElementById('populares-container').style.display = 'none';
}

function filtrarPorConsolaYCategoria(consola, categoria) {
    // Cambia el título de la biblioteca
    document.querySelector('#biblioteca-container h2').textContent = `Juegos para ${consola} - ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`;

    // Limpia el contenedor de biblioteca
    document.querySelector('#biblioteca-container > div').innerHTML = '';

    // Filtra los productos por plataforma y categoría
    const filtrados = productosOrdenadosGlobal.filter(p => 
        p.plataforma === consola && p.categoria.toLowerCase() === categoria.toLowerCase()
    );

    // Muestra solo los filtrados
    filtrados.forEach(producto => {
        document.querySelector('#biblioteca-container > div').innerHTML += crearCard(producto);
    });

    // Oculta las secciones de ofertas y populares
    document.getElementById('ofertas-container').style.display = 'none';
    document.getElementById('populares-container').style.display = 'none';
}

function renderizarSecciones() {
    // Ofertas
    document.querySelector('#ofertas-container > div').innerHTML = '';
    const ofertas = productosOrdenadosGlobal.filter(p => p.oferta === true);
    ofertas.forEach(producto => {
        document.querySelector('#ofertas-container > div').innerHTML += crearCard(producto);
    });

    // Biblioteca
    document.querySelector('#biblioteca-container > div').innerHTML = '';
    productosOrdenadosGlobal.forEach(producto => {
        document.querySelector('#biblioteca-container > div').innerHTML += crearCard(producto);
    });
    document.querySelector('#biblioteca-container h2').textContent = "Biblioteca de Juegos";

    // Populares
    document.querySelector('#populares-container > div').innerHTML = '';
    const populares = productosOrdenadosGlobal.filter(p => p.populares === true);
    populares.forEach(producto => {
        document.querySelector('#populares-container > div').innerHTML += crearCard(producto);
    });
}

// Modifica las funciones de la navbar para restaurar el contenido
function mostrarTodasSecciones() {
    document.getElementById('ofertas-container').style.display = '';
    document.getElementById('biblioteca-container').style.display = '';
    document.getElementById('populares-container').style.display = '';
    renderizarSecciones();
}

function mostrarSoloBiblioteca() {
    document.getElementById('ofertas-container').style.display = 'none';
    document.getElementById('biblioteca-container').style.display = '';
    document.getElementById('populares-container').style.display = 'none';
    document.querySelector('#biblioteca-container > div').innerHTML = '';
    productosOrdenadosGlobal.forEach(producto => {
        document.querySelector('#biblioteca-container > div').innerHTML += crearCard(producto);
    });
    document.querySelector('#biblioteca-container h2').textContent = "Biblioteca de Juegos";
}

function mostrarSoloOfertas() {
    document.getElementById('ofertas-container').style.display = '';
    document.getElementById('biblioteca-container').style.display = 'none';
    document.getElementById('populares-container').style.display = 'none';
    document.querySelector('#ofertas-container > div').innerHTML = '';
    const ofertas = productosOrdenadosGlobal.filter(p => p.oferta === true);
    ofertas.forEach(producto => {
        document.querySelector('#ofertas-container > div').innerHTML += crearCard(producto);
    });
}

function mostrarSoloPopulares() {
    document.getElementById('ofertas-container').style.display = 'none';
    document.getElementById('biblioteca-container').style.display = 'none';
    document.getElementById('populares-container').style.display = '';
    document.querySelector('#populares-container > div').innerHTML = '';
    const populares = productosOrdenadosGlobal.filter(p => p.populares === true);
    populares.forEach(producto => {
        document.querySelector('#populares-container > div').innerHTML += crearCard(producto);
    });
}

// Evento para los enlaces del menú de consolas
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();

    // Filtro solo por consola
    document.querySelectorAll('.filtro-consola').forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            const consola = this.getAttribute('data-consola');
            filtrarPorConsola(consola);
        });
    });

    // Filtro por consola y categoría
    document.querySelectorAll('.filtro-categoria').forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            const consola = this.closest('.dropdown-submenu').querySelector('.filtro-consola').getAttribute('data-consola');
            const categoria = this.getAttribute('data-categoria');
            filtrarPorConsolaYCategoria(consola, categoria);
        });
    });

    // Botón Inicio
    const btnInicio = document.querySelector('.btn-inicio');
    if (btnInicio) {
        btnInicio.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarTodasSecciones();
        });
    }

    // Botón Biblioteca
    const btnBiblioteca = document.querySelector('.btn-biblioteca');
    if (btnBiblioteca) {
        btnBiblioteca.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarSoloBiblioteca();
        });
    }

    // Botón Ofertas
    const btnOfertas = document.querySelector('.btn-ofertas');
    if (btnOfertas) {
        btnOfertas.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarSoloOfertas();
        });
    }

    // Botón Populares
    const btnPopulares = document.querySelector('.btn-populares');
    if (btnPopulares) {
        btnPopulares.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarSoloPopulares();
        });
    }
});

document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-vermas')) {
        e.preventDefault();
        const btn = e.target.closest('.btn-vermas');
        const nombre = btn.getAttribute('data-nombre');
        const categoria = btn.getAttribute('data-categoria');
        const plataforma = btn.getAttribute('data-plataforma');
        const precio = btn.getAttribute('data-precio');
        const imagenBig = `img/${plataforma}/${nombre}_big.jpg`;
        const imagenPlataforma = `img/${plataforma}/${plataforma}.png`;

        // Encabezado del modal
        document.getElementById('modalJuegoLabel').textContent = "Información del producto";
        document.getElementById('modalJuegoImg').src = imagenBig;
        document.getElementById('modalJuegoImg').alt = nombre;

        // Información del juego dentro del modal
        document.getElementById('modalJuegoInfo').innerHTML = `
            <div class="modal-flex-info" style="display: flex; align-items: center; justify-content: center;">
                <img src="${imagenBig}" alt="${nombre}" style="max-width: 220px; max-height: 320px; border-radius: 10px; margin-right: 24px;">
                <div style="text-align: left;">
                    <h2 style="font-size: 30px; font-weight: bold; color: var(--color-azul-oscuro); margin-bottom: 10px;">${nombre}</h2>
                    <span style="display: block; font-weight: bold; color: var(--color-azul-claro); font-size: 22px; margin-bottom: 10px;">
                        ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                        <img class="icono-plataforma-img" src="${imagenPlataforma}" alt="${plataforma}" title="${plataforma}" style="width:32px;height:32px;object-fit:contain;margin-left:12px;vertical-align:middle;">
                    </span>
                    <p style="font-size: 26px; color: var(--color-azul-oscuro); font-weight: bold; margin: 18px 0 0 0;">
                        L. ${parseFloat(precio).toFixed(2)}
                    </p>
                </div>
            </div>
        `;

        // Oculta la imagen superior del modal (si la tienes)
        document.getElementById('modalJuegoImg').style.display = 'none';

        // Muestra el modal
        $('#modalJuego').modal('show');
    }
});