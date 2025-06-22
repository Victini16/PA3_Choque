// Mock data de artículos de ferretería
const initialItems = [
    { id: 1, name: "Martillo", price: 25.99, category: "Herramientas", stock: 20 },
    { id: 2, name: "Destornillador Phillips", price: 12.49, category: "Herramientas", stock: 35 },
    { id: 3, name: "Clavos (caja)", price: 8.99, category: "Fijaciones", stock: 100 },
    { id: 4, name: "Cinta métrica", price: 15.0, category: "Medición", stock: 15 },
    { id: 5, name: "Llave inglesa", price: 18.75, category: "Herramientas", stock: 10 },
    { id: 6, name: "Taladro eléctrico", price: 89.99, category: "Eléctricas", stock: 5 },
];

// Mapa de categorías
const categoryMap = new Map([
    ["all", "Todas"],
    ["Herramientas", "Herramientas"],
    ["Fijaciones", "Fijaciones"],
    ["Medición", "Medición"],
    ["Eléctricas", "Eléctricas"],
]);

let cart = [];
let items = [...initialItems];
let filterCategory = "all";
let searchTerm = "";

// Clase para encapsular la lógica del artículo
class StoreItem {
    constructor(data) {
        Object.assign(this, data);
    }

    get formattedPrice() {
        return `S/${this.price.toFixed(2)}`;
    }

    isInStock(quantity = 1) {
        return this.stock >= quantity;
    }

    reduceStock(quantity) {
        if (this.isInStock(quantity)) {
            this.stock -= quantity;
            return true;
        }
        return false;
    }
}

// Prototipo para métodos adicionales
StoreItem.prototype.getDiscountedPrice = function (discountPercentage) {
    return this.price * (1 - discountPercentage / 100);
};

// Función para filtrar artículos por categoría o término de búsqueda
function filteredItems() {
    return items.filter((item) => {
        const matchesCategory = filterCategory === "all" || item.category === filterCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
}

// Función para renderizar categorías
function renderCategories() {
    const container = document.getElementById("categoryList");
    container.innerHTML = "";
    for (const [key, label] of categoryMap.entries()) {
        const div = document.createElement("div");
        div.innerHTML = `<button onclick="setFilter('${key}')">${label}</button>`;
        container.appendChild(div);
    }
}

// Función para aplicar filtro de categoría
window.setFilter = function (category) {
    filterCategory = category;
    renderProducts();
};

// Función para añadir al carrito
window.addToCart = function (itemId) {
    const itemData = items.find((item) => item.id === itemId);
    const item = new StoreItem(itemData);

    if (item.isInStock()) {
        item.reduceStock(1);

        const existing = cart.find((i) => i.id === itemId);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        updateCartUI();
        renderProducts();
    } else {
        alert("No hay stock suficiente.");
    }
};

// Función para eliminar del carrito
window.removeFromCart = function (itemId) {
    const index = cart.findIndex((item) => item.id === itemId);
    if (index !== -1) {
        cart[index].quantity -= 1;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        const originalItem = items.find((item) => item.id === itemId);
        originalItem.stock += 1;

        updateCartUI();
        renderProducts();
    }
};

// Función para vaciar el carrito
document.getElementById("clearCart").addEventListener("click", () => {
    cart.forEach((item) => {
        const originalItem = items.find((i) => i.id === item.id);
        if (originalItem) {
            //originalItem.stock += item.quantity;
        }
    });

    cart = [];
    updateCartUI();
    renderProducts();
});

// Función para finalizar compra
document.getElementById("checkout").addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
    alert(`Compra realizada por S/${total}`);
    cart.forEach((item) => {
        const originalItem = items.find((i) => i.id === item.id);
        if (originalItem) {
            originalItem.stock -= item.quantity;
        }
    });
    cart = [];
    updateCartUI();
    renderProducts();
});

// Actualiza la interfaz del carrito
function updateCartUI() {
    const cartList = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    cartList.innerHTML = "";

    if (cart.length === 0) {
        cartList.innerHTML = "<li>Tu carrito está vacío.</li>";
        cartTotal.textContent = "Total: S/0.00";
        return;
    }

    let total = 0;

    cart.forEach((item) => {
        const li = document.createElement("li");
        const subtotal = item.price * item.quantity;
        total += subtotal;
        li.innerHTML = `
      ${item.name} x${item.quantity}
      <span>S/${subtotal.toFixed(2)}</span>
      <button onclick="removeFromCart(${item.id})">×</button>
    `;
        cartList.appendChild(li);
    });

    cartTotal.textContent = `Total: S/${total.toFixed(2)}`;
}

// Renderizar productos
function renderProducts() {
    const container = document.getElementById("productGrid");
    container.innerHTML = "";

    filteredItems().forEach((item) => {
        const storeItem = new StoreItem(item);
        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
      <h3>${storeItem.name}</h3>
      <p>${storeItem.category}</p>
      <p>${storeItem.formattedPrice}</p>
      <p>Stock: ${storeItem.stock}</p>
      <button onclick="addToCart(${storeItem.id})" ${!storeItem.isInStock() ? "disabled" : ""}>
        Añadir al carrito
      </button>
    `;
        container.appendChild(div);
    });
}

// Búsqueda en tiempo real
document.getElementById("searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderProducts();
});

// Inicialización
renderCategories();
renderProducts();
updateCartUI();