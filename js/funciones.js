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
                <td>
                    <input type="number" min="1" value="${p.cantidad}" class="input-cantidad-carrito" data-idx="${idx}" style="width:50px; text-align:center;">
                </td>
                <td><button class="btn btn-danger btn-eliminar-carrito" data-idx="${idx}"><i class="fa fa-trash"></i></button></td>
            </tr>
        `;
    });
    document.getElementById('totalCarrito').textContent = `L. ${total.toFixed(2)}`;
    actualizarCarritoCount();
}

// Actualiza el contador del carrito en el navbar
function actualizarCarritoCount() {
    const count = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    document.getElementById('carrito-count').textContent = count;
}

// Notificación simple
function mostrarNotificacion(mensaje, tipo = "info") {
    const notif = document.getElementById('notificacion-pixelplay');
    notif.textContent = mensaje;
    notif.style.background = tipo === "error" ? "#d9534f" : (tipo === "success" ? "#3F56FF" : "var(--color-azul-medio)");
    notif.style.display = "block";
    notif.style.opacity = "0.95";
    setTimeout(() => {
        notif.style.opacity = "0";
        setTimeout(() => { notif.style.display = "none"; }, 400);
    }, 1800);
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
    // Limpiar búsqueda si hay alguna activa
    if (terminoBusquedaActual) {
        terminoBusquedaActual = '';
        resultadosBusqueda = [];
        document.getElementById('searchInputDesktop').value = '';
        document.getElementById('searchInputMobile').value = '';
    }
    
    // Restaurar títulos originales
    document.querySelector('#biblioteca-container h2').textContent = 'Biblioteca de Juegos';
    
    // Mostrar todas las secciones
    document.getElementById('ofertas-container').style.display = 'block';
    document.getElementById('biblioteca-container').style.display = 'block';
    document.getElementById('populares-container').style.display = 'block';
    
    // Recargar contenido original
    cargarProductos();
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

    // Delegación para todos los clicks relevantes
    document.body.addEventListener('click', function(e) {
        // Botón Inicio
        if (e.target.closest('.btn-inicio')) {
            e.preventDefault();
            mostrarTodasSecciones();
            ocultarMenuMovil();
        }
        // Botón Biblioteca
        else if (e.target.closest('.btn-biblioteca')) {
            e.preventDefault();
            mostrarSoloBiblioteca();
            ocultarMenuMovil();
        }
        // Botón Ofertas
        else if (e.target.closest('.btn-ofertas')) {
            e.preventDefault();
            mostrarSoloOfertas();
            ocultarMenuMovil();
        }
        // Botón Populares
        else if (e.target.closest('.btn-populares')) {
            e.preventDefault();
            mostrarSoloPopulares();
            ocultarMenuMovil();
        }
        // Filtro por consola
        else if (e.target.closest('.filtro-consola')) {
            e.preventDefault();
            const consola = e.target.closest('.filtro-consola').getAttribute('data-consola');
            filtrarPorConsola(consola);
            ocultarMenuMovil();
        }
        // Filtro por consola y categoría
        else if (e.target.closest('.filtro-categoria')) {
            e.preventDefault();
            const categoriaEl = e.target.closest('.filtro-categoria');
            const submenu = categoriaEl.closest('.dropdown-submenu');
            const consola = submenu.querySelector('.filtro-consola').getAttribute('data-consola');
            const categoria = categoriaEl.getAttribute('data-categoria');
            filtrarPorConsolaYCategoria(consola, categoria);
            ocultarMenuMovil();
        }
        // Botón carrito en navbar
        else if (e.target.closest('.btn-carrito-navbar')) {
            e.preventDefault();
            actualizarCarritoModal();
            $('#modalCarrito').modal('show');
            ocultarMenuMovil();
        }
        // Botón eliminar producto del carrito
            else if (e.target.closest('.btn-eliminar-carrito')) {
            e.preventDefault();
            const btn = e.target.closest('.btn-eliminar-carrito');
            const idx = parseInt(btn.getAttribute('data-idx'));
            const nombre = carrito[idx].nombre;
            carrito.splice(idx, 1);
            actualizarCarritoModal();
            mostrarNotificacion("Producto eliminado", "error", nombre);
        }
        // Botón ver más
        else if (e.target.closest('.btn-vermas')) {
            e.preventDefault();
            const btn = e.target.closest('.btn-vermas');
            const nombre = btn.getAttribute('data-nombre');
            const categoria = btn.getAttribute('data-categoria');
            const plataforma = btn.getAttribute('data-plataforma');
            const precio = btn.getAttribute('data-precio');
            const imagenBig = `img/${plataforma}/${nombre}_big.jpg`;
            const imagenPlataforma = `img/${plataforma}/${plataforma}.png`;

            document.getElementById('modalJuegoLabel').textContent = "Información del producto";
            document.getElementById('modalJuegoImg').src = imagenBig;
            document.getElementById('modalJuegoImg').alt = nombre;
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
            document.getElementById('modalJuegoImg').style.display = 'none';
            $('#modalJuego').modal('show');
        }
        // Botón agregar al carrito
        else if (e.target.closest('.btn-agregar')) {
            e.preventDefault();
            const btn = e.target.closest('.btn-agregar');
            let nombre, categoria, plataforma, precio;
            if (btn.id === "modalAgregarBtn") {
                nombre = document.querySelector('#modalJuegoInfo h2').textContent;
                categoria = document.querySelector('#modalJuegoInfo span').textContent.trim();
                plataforma = document.querySelector('#modalJuegoInfo img.icono-plataforma-img').title;
                precio = parseFloat(document.querySelector('#modalJuegoInfo p').textContent.replace('L.','').trim());
            } else {
                nombre = btn.getAttribute('data-nombre') || btn.closest('.card-videojuego').querySelector('.titulo-juego').textContent;
                categoria = btn.getAttribute('data-categoria') || btn.closest('.card-videojuego').querySelector('.categoria-juego').textContent;
                plataforma = btn.getAttribute('data-plataforma') || btn.closest('.card-videojuego').querySelector('.icono-plataforma-img').title;
                precio = parseFloat(btn.getAttribute('data-precio')) || parseFloat(btn.closest('.card-videojuego').querySelector('.precio-juego').textContent.replace('L.','').trim());
            }
            agregarAlCarrito({nombre, categoria, plataforma, precio});
            mostrarNotificacion(`Producto agregado: ${nombre}`, "success");
        }
    });

    // Evento para cambio de cantidad con el input
    document.body.addEventListener('input', function(e) {
        if (e.target.classList.contains('input-cantidad-carrito')) {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            let nuevaCantidad = parseInt(e.target.value);
            if (isNaN(nuevaCantidad) || nuevaCantidad < 1) nuevaCantidad = 1;
            carrito[idx].cantidad = nuevaCantidad;
            actualizarCarritoModal();
            mostrarNotificacion(`Cantidad modificada: ${carrito[idx].nombre} (${nuevaCantidad})`, "info");
        }
    });

    // Función para ocultar el menú en móvil
    function ocultarMenuMovil() {
        if (window.innerWidth < 768) {
            $('.navbar-collapse').collapse('hide');
        }
    }
});

document.addEventListener('change', function(e) {
    if (e.target.classList.contains('input-cantidad-carrito')) {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        let nuevaCantidad = parseInt(e.target.value);
        if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
            nuevaCantidad = 1;
            e.target.value = 1;
        }
        carrito[idx].cantidad = nuevaCantidad;
        actualizarCarritoModal();
        mostrarNotificacion("Cantidad modificada", "info", `${carrito[idx].nombre} (${nuevaCantidad})`);
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

// Footer dinámico
document.addEventListener('DOMContentLoaded', function() {
    // Acordeón del footer
    document.querySelectorAll('.footer-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const section = this.closest('.footer-section');
            const isActive = section.classList.contains('active');
            
            // Cierra todas las secciones
            document.querySelectorAll('.footer-section').forEach(s => s.classList.remove('active'));
            
            // Abre la sección actual si no estaba activa
            if (!isActive) {
                section.classList.add('active');
            }
        });
    });

    // Contador animado
    function animateCounter() {
        const counter = document.querySelector('.counter');
        if (counter) {
            const target = parseInt(counter.getAttribute('data-target'));
            let current = 0;
            const increment = target / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current).toLocaleString();
            }, 20);
        }
    }

    // Intersection Observer para activar animaciones
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('footer-pixel')) {
                    setTimeout(animateCounter, 500);
                }
            }
        });
    });

    const footer = document.querySelector('.footer-pixel');
    if (footer) observer.observe(footer);

    // Scroll to top
    const scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Efectos en contacto
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const text = this.querySelector('span').textContent;
            
            if (type === 'email') {
                window.location.href = `mailto:${text}`;
            } else if (type === 'phone') {
                window.location.href = `tel:${text}`;
            }
            
            mostrarNotificacion(`Contacto copiado`, "info", text);
        });
    });

    // Tooltips para redes sociales
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            const platform = this.getAttribute('data-platform');
            mostrarNotificacion(`Síguenos en ${platform}`, "info");
        });
    });

    // Año actual
    const yearSpan = document.querySelector('.current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

// Evento para abrir el modal de agregar producto
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-agregar-producto-navbar')) {
        e.preventDefault();
        $('#modalAgregarProducto').modal('show');
        ocultarMenuMovil();
    }
    
    // Evento para guardar el producto
    if (e.target.closest('#btnGuardarProducto')) {
        e.preventDefault();
        guardarNuevoProducto();
    }
});

// Función para guardar nuevo producto
function guardarNuevoProducto() {
    const nombre = document.getElementById('nombreProducto').value.trim();
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const plataforma = document.getElementById('plataformaProducto').value;
    const categoria = document.getElementById('categoriaProducto').value;
    const oferta = document.getElementById('ofertaProducto').checked;
    const popular = document.getElementById('popularProducto').checked;
    const imagenPortada = document.getElementById('imagenPortada').files[0];
    const imagenBig = document.getElementById('imagenBig').files[0];
    
    // Validaciones
    if (!nombre || !precio || !plataforma || !categoria || !imagenPortada || !imagenBig) {
        mostrarNotificacion("Complete todos los campos obligatorios", "error");
        return;
    }
    
    if (precio <= 0) {
        mostrarNotificacion("El precio debe ser mayor a 0", "error");
        return;
    }
    
    // Procesar las imágenes
    procesarImagenes(imagenPortada, imagenBig, nombre, plataforma).then(() => {
        // Crear el nuevo producto
        const nuevoProducto = {
            nombre: nombre,
            precio: precio,
            plataforma: plataforma,
            categoria: categoria,
            oferta: oferta,
            populares: popular
        };
        
        // Agregar al array global
        productosOrdenadosGlobal.push(nuevoProducto);
        
        // Recargar las secciones
        renderizarSecciones();
        
        // Limpiar formulario
        document.getElementById('formAgregarProducto').reset();
        limpiarPreviews();
        
        // Cerrar modal y mostrar notificación
        $('#modalAgregarProducto').modal('hide');
        mostrarNotificacion("Producto agregado exitosamente", "success", nombre);
    }).catch(error => {
        mostrarNotificacion("Error al procesar las imágenes", "error");
        console.error(error);
    });
}

// Función para procesar las imágenes
async function procesarImagenes(imagenPortada, imagenBig, nombre, plataforma) {
    return new Promise((resolve, reject) => {
        try {
            // Simular guardado de imágenes
            // En un entorno real, aquí subirías las imágenes al servidor
            
            // Por ahora, creamos URLs temporales para mostrar las imágenes
            const urlPortada = URL.createObjectURL(imagenPortada);
            const urlBig = URL.createObjectURL(imagenBig);
            
            // Aquí podrías implementar la lógica para:
            // 1. Renombrar los archivos según el patrón: nombre.jpg y nombre_big.jpg
            // 2. Subirlos a la carpeta img/[plataforma]/
            // 3. Validar que sean imágenes válidas
            
            console.log(`Imágenes procesadas para ${nombre}:`);
            console.log(`Portada: ${urlPortada}`);
            console.log(`Grande: ${urlBig}`);
            
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// Eventos para preview de imágenes
document.addEventListener('change', function(e) {
    if (e.target.id === 'imagenPortada') {
        mostrarPreview(e.target, 'previewPortada');
    } else if (e.target.id === 'imagenBig') {
        mostrarPreview(e.target, 'previewBig');
    }
});

function mostrarPreview(input, previewId) {
    const preview = document.getElementById(previewId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.classList.remove('empty');
        };
        
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = 'Vista previa de la imagen';
        preview.classList.add('empty');
    }
}

function limpiarPreviews() {
    document.getElementById('previewPortada').innerHTML = 'Vista previa de la imagen';
    document.getElementById('previewPortada').classList.add('empty');
    document.getElementById('previewBig').innerHTML = 'Vista previa de la imagen';
    document.getElementById('previewBig').classList.add('empty');
}

// Inicializar previews vacíos al cargar
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar previews
    const previewPortada = document.getElementById('previewPortada');
    const previewBig = document.getElementById('previewBig');
    
    if (previewPortada) {
        previewPortada.innerHTML = 'Vista previa de la imagen';
        previewPortada.classList.add('empty');
    }
    
    if (previewBig) {
        previewBig.innerHTML = 'Vista previa de la imagen';
        previewBig.classList.add('empty');
    }
});

// Actualizar el evento para limpiar el formulario
$('#modalAgregarProducto').on('hidden.bs.modal', function () {
    document.getElementById('formAgregarProducto').reset();
    limpiarPreviews();
});

// Agrega estas funciones a tu funciones.js

// Variables para búsqueda
let resultadosBusqueda = [];
let terminoBusquedaActual = '';

// Eventos para búsqueda
document.addEventListener('click', function(e) {
    // Botón búsqueda móvil toggle
    if (e.target.closest('#toggleSearchMobile')) {
        e.preventDefault();
        toggleSearchMobile();
    }
    
    // Botón cerrar búsqueda móvil
    if (e.target.closest('#btnCerrarSearchMobile')) {
        e.preventDefault();
        closeSearchMobile();
    }
    
    // Botón buscar desktop
    if (e.target.closest('#btnBuscarDesktop')) {
        e.preventDefault();
        buscarProductos('desktop');
    }
    
    // Botón buscar móvil
    if (e.target.closest('#btnBuscarMobile')) {
        e.preventDefault();
        buscarProductos('mobile');
    }
});

// Eventos para Enter en campos de búsqueda
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (e.target.id === 'searchInputDesktop') {
            e.preventDefault();
            buscarProductos('desktop');
        } else if (e.target.id === 'searchInputMobile') {
            e.preventDefault();
            buscarProductos('mobile');
        }
    }
});

// Función para mostrar/ocultar búsqueda móvil
function toggleSearchMobile() {
    const searchContainer = document.getElementById('searchMobileContainer');
    const isVisible = searchContainer.classList.contains('show');
    
    if (isVisible) {
        closeSearchMobile();
    } else {
        searchContainer.classList.add('show');
        document.getElementById('searchInputMobile').focus();
        // Oculta el menú si está abierto
        $('.navbar-collapse').collapse('hide');
    }
}

// Función para cerrar búsqueda móvil
function closeSearchMobile() {
    const searchContainer = document.getElementById('searchMobileContainer');
    searchContainer.classList.remove('show');
    document.getElementById('searchInputMobile').value = '';
    
    // Si hay una búsqueda activa, volver a mostrar todos los productos
    if (terminoBusquedaActual) {
        limpiarBusqueda();
    }
}

// Función principal de búsqueda
function buscarProductos(tipo) {
    const inputId = tipo === 'desktop' ? 'searchInputDesktop' : 'searchInputMobile';
    const termino = document.getElementById(inputId).value.trim().toLowerCase();
    
    if (!termino) {
        mostrarNotificacion("Ingrese un término de búsqueda", "info");
        return;
    }
    
    terminoBusquedaActual = termino;
    
    // Filtrar productos que coincidan con el nombre
    resultadosBusqueda = productosOrdenadosGlobal.filter(producto => 
        producto.nombre.toLowerCase().includes(termino)
    );
    
    if (resultadosBusqueda.length === 0) {
        mostrarNotificacion("No se encontraron resultados", "info", `para "${termino}"`);
        return;
    }
    
    // Mostrar resultados
    mostrarResultadosBusqueda(termino);
    
    // Cerrar búsqueda móvil si está abierta
    if (tipo === 'mobile') {
        closeSearchMobile();
    }
    
    mostrarNotificacion("Búsqueda realizada", "success", `${resultadosBusqueda.length} resultado(s) encontrado(s)`);
}

// Función para mostrar resultados de búsqueda
function mostrarResultadosBusqueda(termino) {
    // Ocultar todas las secciones
    document.getElementById('ofertas-container').style.display = 'none';
    document.getElementById('populares-container').style.display = 'none';
    
    // Cambiar título y mostrar resultados en biblioteca
    const bibliotecaContainer = document.getElementById('biblioteca-container');
    const titulo = bibliotecaContainer.querySelector('h2');
    titulo.textContent = `Resultados de búsqueda: "${termino}"`;
    
    // Limpiar y llenar con resultados
    const contenedor = bibliotecaContainer.querySelector('div');
    contenedor.innerHTML = '';
    
    resultadosBusqueda.forEach(producto => {
        contenedor.innerHTML += crearCard(producto);
    });
    
    bibliotecaContainer.style.display = 'block';
    
    // Scroll hacia los resultados
    bibliotecaContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Función para limpiar búsqueda y volver al estado normal
function limpiarBusqueda() {
    terminoBusquedaActual = '';
    resultadosBusqueda = [];
    
    // Limpiar campos de búsqueda
    document.getElementById('searchInputDesktop').value = '';
    document.getElementById('searchInputMobile').value = '';
    
    // Restaurar vista normal
    mostrarTodasSecciones();
}

// Función para que la búsqueda sea dinámica (opcional)
document.addEventListener('input', function(e) {
    if (e.target.id === 'searchInputDesktop' || e.target.id === 'searchInputMobile') {
        const valor = e.target.value.trim();
        
        // Si se borra el campo, volver a mostrar todo
        if (!valor && terminoBusquedaActual) {
            limpiarBusqueda();
        }
        
        // Búsqueda dinámica después de 3 caracteres (opcional)
        // if (valor.length >= 3) {
        //     buscarProductos(e.target.id === 'searchInputDesktop' ? 'desktop' : 'mobile');
        // }
    }
});