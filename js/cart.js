/* ============================================
   PHARMACIE GHANDOUR - Gestion du Panier
   ============================================ */

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Attendre le chargement des produits si nécessaire
    if (window.PharmacieApp && window.PharmacieApp.getProducts().length > 0) {
        initCartPage();
    } else {
        document.addEventListener('productsLoaded', initCartPage);
    }
});

function initCartPage() {
    const isCartPage = window.location.pathname.includes('panier.html');

    if (isCartPage) {
        displayCart();
    }
}

/* ============================================
   Affichage du panier
   ============================================ */
function displayCart() {
    const container = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('cart-summary');

    if (!container) return;

    const cart = window.PharmacieApp.getCart();

    if (cart.length === 0) {
        displayEmptyCart(container);
        if (summaryContainer) summaryContainer.style.display = 'none';
        return;
    }

    // Récupérer les produits complets
    const cartItems = cart.map(item => {
        const product = window.PharmacieApp.getProductById(item.id);
        if (!product) return null;
        return {
            ...product,
            quantity: item.quantity
        };
    }).filter(item => item !== null);

    // Si tous les produits ont été supprimés de la base
    if (cartItems.length === 0) {
        window.PharmacieApp.clearCart();
        displayEmptyCart(container);
        if (summaryContainer) summaryContainer.style.display = 'none';
        return;
    }

    // Afficher les articles
    container.innerHTML = cartItems.map(item => createCartItemHtml(item)).join('');

    // Attacher les événements
    attachCartEvents(container);

    // Mettre à jour le résumé
    updateCartSummary(cartItems);

    if (summaryContainer) summaryContainer.style.display = 'block';
}

function displayEmptyCart(container) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🛒</div>
            <h3>Votre panier est vide</h3>
            <p>Parcourez notre catalogue et ajoutez des produits à votre panier.</p>
            <a href="index.html" class="btn btn-primary">Découvrir nos produits</a>
        </div>
    `;

    // Masquer le bouton de commande
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) checkoutBtn.style.display = 'none';
}

function createCartItemHtml(item) {
    return `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="cart-item-image">
                <a href="produit.html?id=${item.id}">
                    <img src="${item.image}" alt="${window.PharmacieApp.escapeHtml(item.nom)}">
                </a>
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-name">
                    <a href="produit.html?id=${item.id}">${window.PharmacieApp.escapeHtml(item.nom)}</a>
                </h4>
                <p class="cart-item-brand">${window.PharmacieApp.escapeHtml(item.marque)}</p>
                <p class="cart-item-price">${window.PharmacieApp.formatPrice(item.prix)}</p>
                <div class="cart-item-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn minus" data-action="decrease">−</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99">
                        <button class="quantity-btn plus" data-action="increase">+</button>
                    </div>
                    <button class="cart-item-remove" data-action="remove">
                        Supprimer
                    </button>
                </div>
            </div>
            <div class="cart-item-total">
                <strong>${window.PharmacieApp.formatPrice(item.prix * item.quantity)}</strong>
            </div>
        </div>
    `;
}

function attachCartEvents(container) {
    // Boutons quantité
    container.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const productId = cartItem.dataset.productId;
            const input = cartItem.querySelector('.quantity-input');
            const currentQty = parseInt(input.value) || 1;

            if (this.dataset.action === 'increase') {
                updateCartItemQuantity(productId, currentQty + 1);
            } else if (this.dataset.action === 'decrease') {
                if (currentQty > 1) {
                    updateCartItemQuantity(productId, currentQty - 1);
                }
            }
        });
    });

    // Input quantité
    container.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const cartItem = this.closest('.cart-item');
            const productId = cartItem.dataset.productId;
            let quantity = parseInt(this.value) || 1;

            if (quantity < 1) quantity = 1;
            if (quantity > 99) quantity = 99;

            updateCartItemQuantity(productId, quantity);
        });
    });

    // Boutons supprimer
    container.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const productId = cartItem.dataset.productId;
            removeFromCart(productId);
        });
    });
}

/* ============================================
   Opérations sur le panier
   ============================================ */
function updateCartItemQuantity(productId, quantity) {
    const cart = window.PharmacieApp.getCart();
    const item = cart.find(i => i.id === productId);

    if (item) {
        item.quantity = quantity;
        window.PharmacieApp.saveCart(cart);
        displayCart();
    }
}

function removeFromCart(productId) {
    const cart = window.PharmacieApp.getCart();
    const product = window.PharmacieApp.getProductById(productId);
    const updatedCart = cart.filter(item => item.id !== productId);

    window.PharmacieApp.saveCart(updatedCart);

    if (product) {
        window.PharmacieApp.showToast(`${product.nom} retiré du panier`, 'info');
    }

    displayCart();
}

/* ============================================
   Résumé du panier
   ============================================ */
function updateCartSummary(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.prix * item.quantity), 0);
    const total = subtotal; // Pas de frais de livraison pour le retrait en pharmacie

    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const itemCountEl = document.getElementById('cart-item-count');

    if (subtotalEl) subtotalEl.textContent = window.PharmacieApp.formatPrice(subtotal);
    if (totalEl) totalEl.textContent = window.PharmacieApp.formatPrice(total);

    if (itemCountEl) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        itemCountEl.textContent = `${totalItems} article${totalItems > 1 ? 's' : ''}`;
    }

    // Activer/désactiver le bouton de commande
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.style.display = 'block';
        checkoutBtn.disabled = cartItems.length === 0;
    }
}

/* ============================================
   Récapitulatif pour la page commande
   ============================================ */
function displayOrderSummary() {
    const container = document.getElementById('order-items');
    if (!container) return;

    const cart = window.PharmacieApp.getCart();

    if (cart.length === 0) {
        window.location.href = 'panier.html';
        return;
    }

    const cartItems = cart.map(item => {
        const product = window.PharmacieApp.getProductById(item.id);
        if (!product) return null;
        return { ...product, quantity: item.quantity };
    }).filter(item => item !== null);

    container.innerHTML = cartItems.map(item => `
        <div class="order-item">
            <span class="name">${window.PharmacieApp.escapeHtml(item.nom)}</span>
            <span class="qty">x${item.quantity}</span>
            <span class="price">${window.PharmacieApp.formatPrice(item.prix * item.quantity)}</span>
        </div>
    `).join('');

    const total = cartItems.reduce((sum, item) => sum + (item.prix * item.quantity), 0);

    const totalEl = document.getElementById('order-total');
    if (totalEl) totalEl.textContent = window.PharmacieApp.formatPrice(total);
}

/* ============================================
   Export global
   ============================================ */
window.CartManager = {
    displayCart,
    updateCartItemQuantity,
    removeFromCart,
    displayOrderSummary
};
