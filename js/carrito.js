// carrito.js
let carrito = [];

$(document).ready(function() {
    // Cargar carrito desde localStorage
    if(localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'));
        actualizarContador();
    }

    // Añadir al carrito
    $(document).on('click', '.add-to-cart', function() {
        const id = $(this).data('id');
        const nombre = $(this).data('name');
        const precio = $(this).data('price');
        
        const itemExistente = carrito.find(item => item.id === id);
        
        if(itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            carrito.push({
                id,
                nombre,
                precio,
                cantidad: 1
            });
        }
        
        guardarCarrito();
        actualizarContador();
        mostrarNotificacion(`${nombre} añadido al carrito`);
    });

    // Mostrar carrito
    $('#cart-button').click(function(e) {
        e.preventDefault();
        mostrarCarrito();
    });
});

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarContador() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    $('.cart-count').text(totalItems);
}

function mostrarCarrito() {
    const $tbody = $('#cart-items');
    $tbody.empty();
    
    let subtotal = 0;
    
    carrito.forEach(item => {
        const totalItem = item.precio * item.cantidad;
        subtotal += totalItem;
        
        const fila = `
        <tr>
            <td>${item.nombre}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>
                <input type="number" min="1" value="${item.cantidad}" 
                       class="form-control quantity-input" 
                       data-id="${item.id}" style="width: 70px;">
            </td>
            <td>$${totalItem.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm remove-item" 
                        data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
        
        $tbody.append(fila);
    });
    
    const impuestos = subtotal * 0.15;
    const total = subtotal + impuestos;
    
    $('#subtotal').text(`$${subtotal.toFixed(2)}`);
    $('#impuestos').text(`$${impuestos.toFixed(2)}`);
    $('#total').text(`$${total.toFixed(2)}`);
    
    $('#cartModal').modal('show');
}

function mostrarNotificacion(mensaje) {
    const notificacion = $(`<div class="notification">${mensaje}</div>`);
    $('body').append(notificacion);
    
    setTimeout(() => {
        notificacion.fadeOut(() => notificacion.remove());
    }, 3000);
}