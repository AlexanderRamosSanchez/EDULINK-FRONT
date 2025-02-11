// products.js
let productsTable;

document.addEventListener('DOMContentLoaded', function() {
    // Event listeners
    document.getElementById('btnSaveProduct').addEventListener('click', saveProduct);
    document.getElementById('btnExportExcel').addEventListener('click', exportToExcel);
    document.querySelector('[data-bs-target="#productModal"]').addEventListener('click', showProductModal);
    
    // Inicializar la tabla de productos
    initializeProductsTable();
});

function initializeProductsTable() {
    const productsTableElement = document.getElementById('productsTable');
    
    if (productsTableElement) {
        // Destroy existing DataTable if it exists
        if ($.fn.DataTable.isDataTable('#productsTable')) {
            $('#productsTable').DataTable().destroy();
        }

        // Ensure table is visible
        productsTableElement.style.visibility = 'visible';
        
        // Initialize DataTable
        productsTable = $('#productsTable').DataTable({
            ajax: {
                url: '/api/products',
                dataSrc: ''
            },
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'category' },
                { 
                    data: 'price',
                    render: (data) => `$${parseFloat(data).toFixed(2)}`
                },
                { data: 'stock' },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `
                            <button class="btn btn-sm btn-warning me-1" onclick="editProduct(${row.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${row.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        `;
                    }
                }
            ],
            responsive: true,
            pageLength: 10,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            },
            drawCallback: function() {
                $(window).trigger('resize');
            },
            initComplete: function() {
                // Ensure proper layout after initialization
                setTimeout(() => {
                    $(window).trigger('resize');
                }, 100);
            }
        });
    }
}

function showProductModal() {
    const productForm = document.getElementById('productForm');
    productForm.reset();
    document.getElementById('productId').value = '';
    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    productForm.classList.remove('was-validated');
    $('#productModal').modal('show');
}

async function saveProduct() {
    const productForm = document.getElementById('productForm');

    if (!productForm.checkValidity()) {
        productForm.classList.add('was-validated');
        return;
    }

    const productId = document.getElementById('productId').value;
    const product = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value)
    };

    try {
        const url = productId 
            ? `/api/products/${productId}`
            : '/api/products';
        
        const method = productId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            $('#productModal').modal('hide');
            productsTable.ajax.reload();
            await Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: productId ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
                timer: 2000
            });
        } else {
            throw new Error('Error en la operación');
        }
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al procesar la operación'
        });
    }
}

async function editProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Error al obtener el producto');
        
        const product = await response.json();

        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('modalTitle').textContent = 'Editar Producto';
        
        $('#productModal').modal('show');
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar el producto'
        });
    }
}

async function deleteProduct(id) {
    try {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: "Esta acción no se puede revertir",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                productsTable.ajax.reload();
                await Swal.fire(
                    'Eliminado',
                    'El producto ha sido eliminado.',
                    'success'
                );
            } else {
                throw new Error('Error al eliminar');
            }
        }
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al eliminar el producto'
        });
    }
}

function exportToExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(document.getElementById('productsTable'));
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'productos.xlsx');
}