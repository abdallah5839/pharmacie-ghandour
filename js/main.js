/* ============================================
   PHARMACIE GHANDOUR - Main JavaScript
   Navigation, Recherche, Utilitaires
   ============================================ */

// Configuration globale
const CONFIG = {
    currency: 'FCFA',
    phonePrefixes: ['+221', '77', '78', '76', '70', '75', '33'],
    storeInfo: {
        name: 'Pharmacie Ghandour',
        address: 'Rue Huart, Dakar, Sénégal',
        phone: '+221 33 821 68 20',
        email: 'contact@pharmacieghandour.sn',
        hours: 'Lun-Ven: 08:30-19:30 | Sam: 08:30-13:00 | Dim: Fermé'
    }
};

// État global de l'application
const AppState = {
    menuOpen: false,
    searchOpen: false,
    products: [],
    categories: [],
    dataSource: null
};

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('========================================');
    console.log('📱 MAIN.JS - DOMCONTENTLOADED');
    console.log('========================================');
    console.log('URL:', window.location.href);

    console.log('1️⃣ initNavigation()...');
    initNavigation();

    console.log('2️⃣ initSearch()...');
    initSearch();

    console.log('3️⃣ initCartIcon()...');
    initCartIcon();

    console.log('4️⃣ loadProducts()...');
    loadProducts();

    console.log('📱 MAIN.JS - Init terminée, attente chargement async...');
});

/* ============================================
   Navigation
   ============================================ */
function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            AppState.menuOpen = !AppState.menuOpen;
            menuToggle.classList.toggle('active', AppState.menuOpen);
            navLinks.classList.toggle('active', AppState.menuOpen);
        });

        // Fermer le menu si on clique en dehors
        document.addEventListener('click', function(e) {
            if (AppState.menuOpen && !menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                AppState.menuOpen = false;
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // Marquer le lien actif
    highlightActiveLink();
}

function highlightActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/* ============================================
   Recherche
   ============================================ */
function initSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchSuggestions = document.querySelector('.search-suggestions');

    if (!searchInput) return;

    let debounceTimer;

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();

        clearTimeout(debounceTimer);

        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        debounceTimer = setTimeout(() => {
            searchProducts(query);
        }, 300);
    });

    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length >= 2) {
            showSuggestions();
        }
    });

    // Fermer les suggestions si on clique en dehors
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-bar')) {
            hideSuggestions();
        }
    });

    // Navigation clavier dans les suggestions
    searchInput.addEventListener('keydown', function(e) {
        const suggestions = document.querySelectorAll('.search-suggestion-item');
        const active = document.querySelector('.search-suggestion-item.active');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateSuggestions(suggestions, active, 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateSuggestions(suggestions, active, -1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (active) {
                window.location.href = active.dataset.href;
            } else if (this.value.trim()) {
                window.location.href = `categorie.html?search=${encodeURIComponent(this.value.trim())}`;
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
            this.blur();
        }
    });
}

function searchProducts(query) {
    const products = AppState.products;
    const normalizedQuery = normalizeText(query);

    const results = products.filter(product => {
        return normalizeText(product.nom).includes(normalizedQuery) ||
               normalizeText(product.marque).includes(normalizedQuery) ||
               normalizeText(product.categorie).includes(normalizedQuery);
    }).slice(0, 6);

    displaySuggestions(results, query);
}

function displaySuggestions(results, query) {
    const container = document.querySelector('.search-suggestions');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = `
            <div class="search-suggestion-item no-results">
                <span>Aucun résultat pour "${escapeHtml(query)}"</span>
            </div>
        `;
    } else {
        container.innerHTML = results.map(product => `
            <div class="search-suggestion-item" data-href="produit.html?id=${product.id}">
                <img src="${product.image}" alt="${escapeHtml(product.nom)}" width="40" height="40" style="border-radius: 4px; object-fit: cover;">
                <div>
                    <div style="font-weight: 500;">${highlightMatch(product.nom, query)}</div>
                    <div style="font-size: 0.8rem; color: var(--text-gray);">${formatPrice(product.prix)}</div>
                </div>
            </div>
        `).join('');

        // Ajouter événements de clic
        container.querySelectorAll('.search-suggestion-item').forEach(item => {
            if (item.dataset.href) {
                item.addEventListener('click', () => {
                    window.location.href = item.dataset.href;
                });
            }
        });
    }

    showSuggestions();
}

function showSuggestions() {
    const container = document.querySelector('.search-suggestions');
    if (container) container.classList.add('active');
}

function hideSuggestions() {
    const container = document.querySelector('.search-suggestions');
    if (container) container.classList.remove('active');
}

function navigateSuggestions(suggestions, active, direction) {
    if (suggestions.length === 0) return;

    let index = -1;
    if (active) {
        active.classList.remove('active');
        index = Array.from(suggestions).indexOf(active);
    }

    index += direction;
    if (index < 0) index = suggestions.length - 1;
    if (index >= suggestions.length) index = 0;

    suggestions[index].classList.add('active');
    suggestions[index].scrollIntoView({ block: 'nearest' });
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escapeHtml(text).replace(regex, '<strong>$1</strong>');
}

/* ============================================
   Icône Panier
   ============================================ */
function initCartIcon() {
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Mettre à jour le badge du header
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.classList.toggle('hidden', totalItems === 0);
    }

    // Mettre à jour le badge de la bottom nav
    const bottomCartCount = document.getElementById('bottom-cart-count');
    if (bottomCartCount) {
        bottomCartCount.textContent = totalItems;
        bottomCartCount.classList.toggle('hidden', totalItems === 0);
    }
}

/* ============================================
   Chargement des produits (Sanity + Fallback JSON)
   ============================================ */
async function loadProducts() {
    console.log('🔄 Début du chargement des produits...');

    // Timeout pour éviter le chargement infini (10 secondes)
    const timeoutPromise = (ms) => new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: Sanity API trop lent')), ms)
    );

    try {
        // Essayer de charger depuis Sanity d'abord
        if (window.SanityClient) {
            console.log('🔄 Chargement depuis Sanity CMS...');

            const [sanityProducts, sanityCategories] = await Promise.race([
                Promise.all([
                    window.SanityClient.getProducts(),
                    window.SanityClient.getCategories()
                ]),
                timeoutPromise(10000) // 10 secondes max
            ]);

            console.log('📦 Sanity - Produits:', sanityProducts?.length || 0);
            console.log('📁 Sanity - Catégories:', sanityCategories?.length || 0);

            if (sanityProducts && sanityProducts.length > 0) {
                // Transformer les produits Sanity au format attendu
                AppState.products = sanityProducts.map(p => window.SanityClient.transformProduct(p));
                AppState.categories = (sanityCategories || []).map(c => window.SanityClient.transformCategory(c));
                AppState.dataSource = 'sanity';

                console.log('✅ Données chargées depuis SANITY CMS');
                console.log('💰 Premier produit:', AppState.products[0]?.nom, '-', AppState.products[0]?.prix, 'FCFA');

                document.dispatchEvent(new CustomEvent('productsLoaded', {
                    detail: {
                        products: AppState.products,
                        categories: AppState.categories,
                        source: 'sanity'
                    }
                }));
                return;
            } else {
                console.warn('⚠️ Sanity a retourné 0 produits, fallback sur JSON');
            }
        } else {
            console.warn('⚠️ SanityClient non disponible, fallback sur JSON');
        }

        // Fallback: charger depuis le fichier JSON local
        await loadProductsFromJSON();

    } catch (error) {
        console.error('❌ Erreur Sanity:', error);
        console.warn('🔄 Fallback sur JSON local...');
        await loadProductsFromJSON();
    }
}

async function loadProductsFromJSON() {
    try {
        console.log('🔄 Chargement depuis JSON local...');
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error('Erreur de chargement JSON: ' + response.status);

        const data = await response.json();
        AppState.products = data.products || [];
        AppState.categories = data.categories || [];
        AppState.dataSource = 'json';

        console.log('📁 Données chargées depuis JSON local');
        console.log('📦 Produits:', AppState.products.length);
        console.log('📁 Catégories:', AppState.categories.length);

        document.dispatchEvent(new CustomEvent('productsLoaded', {
            detail: {
                products: AppState.products,
                categories: AppState.categories,
                source: 'json'
            }
        }));
        console.log('✅ Événement productsLoaded déclenché (JSON)');
    } catch (error) {
        console.error('❌ Impossible de charger les produits:', error);
        AppState.products = [];
        AppState.categories = [];

        // Déclencher l'événement même en cas d'erreur pour débloquer l'UI
        document.dispatchEvent(new CustomEvent('productsLoaded', {
            detail: {
                products: [],
                categories: [],
                source: 'error',
                error: error.message
            }
        }));
        console.log('⚠️ Événement productsLoaded déclenché (avec erreur)');
    }
}

function getProducts() {
    return AppState.products;
}

function getCategories() {
    return AppState.categories;
}

function getProductById(id) {
    if (!id) return null;

    // Recherche exacte d'abord
    let product = AppState.products.find(p => p.id === id);

    // Si pas trouvé, essayer des correspondances alternatives
    if (!product) {
        product = AppState.products.find(p =>
            p.id === `product-${id}` ||
            (p.id && p.id.includes(id)) ||
            (id && id.includes(p.id))
        );
    }

    return product;
}

function getProductsByCategory(categoryId) {
    return AppState.products.filter(p => p.categorie === categoryId);
}

function getPopularProducts() {
    return AppState.products.filter(p => p.populaire);
}

/* ============================================
   Utilitaires
   ============================================ */
function formatPrice(price) {
    // Gestion des prix invalides
    if (price === null || price === undefined || isNaN(price)) {
        console.warn('⚠️ Prix invalide:', price);
        return '-- ' + CONFIG.currency;
    }
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + CONFIG.currency;
}

function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PG-${timestamp}-${random}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ============================================
   Notifications Toast
   ============================================ */
function showToast(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');

    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${escapeHtml(message)}</span>
        <button class="toast-close" aria-label="Fermer">&times;</button>
    `;

    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });

    setTimeout(() => {
        removeToast(toast);
    }, duration);
}

function removeToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
}

/* ============================================
   Panier - Fonctions de base (utilisées par cart.js)
   ============================================ */
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('pharmacie_cart')) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('pharmacie_cart', JSON.stringify(cart));
    updateCartCount();
}

function clearCart() {
    localStorage.removeItem('pharmacie_cart');
    updateCartCount();
}

/* ============================================
   URL Params
   ============================================ */
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function setUrlParam(param, value) {
    const url = new URL(window.location);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    window.history.replaceState({}, '', url);
}

/* ============================================
   Export global
   ============================================ */
window.PharmacieApp = {
    CONFIG,
    formatPrice,
    showToast,
    getCart,
    saveCart,
    clearCart,
    getProducts,
    getCategories,
    getProductById,
    getProductsByCategory,
    getPopularProducts,
    getUrlParam,
    setUrlParam,
    generateOrderNumber,
    updateCartCount,
    normalizeText,
    escapeHtml,
    debounce,
    throttle
};
