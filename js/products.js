/* ============================================
   PHARMACIE GHANDOUR - Gestion des Produits
   Filtres, Tri, Affichage
   ============================================ */

// État des filtres
const FilterState = {
    category: null,
    search: '',
    priceMin: 0,
    priceMax: Infinity,
    brands: [],
    inStockOnly: false,
    sortBy: 'nom',
    sortOrder: 'asc',
    page: 1,
    perPage: 12
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('========================================');
    console.log('📄 PRODUCTS.JS - DOMCONTENTLOADED');
    console.log('========================================');
    console.log('URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Search:', window.location.search);

    // Vérifier l'état actuel
    console.log('PharmacieApp existe?', !!window.PharmacieApp);
    console.log('SanityClient existe?', !!window.SanityClient);

    if (window.PharmacieApp) {
        const currentProducts = window.PharmacieApp.getProducts();
        console.log('Produits déjà chargés?', currentProducts.length);
    }

    // Attendre le chargement des produits
    document.addEventListener('productsLoaded', function(e) {
        console.log('========================================');
        console.log('📄 EVENT: productsLoaded REÇU!');
        console.log('========================================');
        console.log('Source:', e.detail?.source);
        console.log('Nombre de produits:', e.detail?.products?.length);
        initProductsPage();
    });

    // Si les produits sont déjà chargés
    if (window.PharmacieApp && window.PharmacieApp.getProducts().length > 0) {
        console.log('✅ Produits déjà disponibles, initialisation immédiate');
        initProductsPage();
    } else {
        console.log('⏳ En attente du chargement des produits...');
        console.log('   (l\'événement productsLoaded devrait arriver bientôt)');

        // FALLBACK: Si après 3 secondes les produits ne sont toujours pas là, réessayer
        setTimeout(function() {
            if (window.PharmacieApp && window.PharmacieApp.getProducts().length > 0) {
                console.log('⏰ FALLBACK: Produits trouvés après délai, initialisation...');
                initProductsPage();
            } else {
                console.error('❌ FALLBACK: Toujours pas de produits après 3 secondes!');
                console.log('Vérification manuelle...');

                // Essayer de recharger les produits manuellement
                if (window.SanityClient) {
                    console.log('Tentative de rechargement depuis Sanity...');
                    window.SanityClient.getProducts().then(products => {
                        console.log('Produits récupérés manuellement:', products?.length);
                        if (products && products.length > 0) {
                            // Forcer la mise à jour de AppState via un hack
                            const transformed = products.map(p => window.SanityClient.transformProduct(p));
                            console.log('Produits transformés:', transformed.length);

                            // Stocker temporairement pour la page produit
                            window._tempProducts = transformed;
                            initProductsPage();
                        }
                    }).catch(err => {
                        console.error('Erreur rechargement:', err);
                    });
                }
            }
        }, 3000);
    }
});

function initProductsPage() {
    console.log('🚀 initProductsPage() appelée');
    console.log('🔗 URL actuelle:', window.location.pathname);
    console.log('🔗 Params URL:', window.location.search);

    // Déterminer la page actuelle (supporte avec ou sans .html)
    const pathname = window.location.pathname;
    const isHomePage = pathname.endsWith('index.html') || pathname.endsWith('/') || pathname === '';
    const isCategoryPage = pathname.includes('categorie.html') || pathname.includes('/categorie');
    const isProductPage = pathname.includes('produit.html') || pathname.includes('/produit');

    console.log('📍 Type de page - Home:', isHomePage, '| Catégorie:', isCategoryPage, '| Produit:', isProductPage);

    // La page d'accueil utilise maintenant les carrousels (carousel.js)
    if (isCategoryPage) {
        console.log('➡️ Initialisation page CATÉGORIE');
        initCategoryPage();
    } else if (isProductPage) {
        console.log('➡️ Initialisation page PRODUIT');
        initProductPage();
    } else {
        console.log('➡️ Page d\'accueil, pas d\'init spécifique ici');
    }
}

/* ============================================
   Page d'accueil
   ============================================ */
function displayCategories() {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    const categories = window.PharmacieApp.getCategories();

    container.innerHTML = categories.map(cat => `
        <a href="categorie.html?cat=${cat.id}" class="category-card">
            <div class="category-icon"><span class="icon icon-lg">${window.PharmacieIcons.getCategoryIcon(cat.id)}</span></div>
            <h3>${window.PharmacieApp.escapeHtml(cat.nom)}</h3>
            <p>${cat.count} produits</p>
        </a>
    `).join('');
}

function displayPopularProducts() {
    const container = document.getElementById('popular-products-grid');
    if (!container) return;

    const products = window.PharmacieApp.getPopularProducts().slice(0, 8);

    container.innerHTML = products.map(product => createProductCard(product)).join('');
    attachProductCardEvents(container);
}

/* ============================================
   Page Catégorie
   ============================================ */
function initCategoryPage() {
    // Récupérer les paramètres URL
    const category = window.PharmacieApp.getUrlParam('cat');
    const search = window.PharmacieApp.getUrlParam('search');

    if (category) {
        FilterState.category = category;
        updateBreadcrumb(category);
        updatePageTitle(category);
    }

    if (search) {
        FilterState.search = search;
        const searchInput = document.querySelector('.search-filter-input');
        if (searchInput) searchInput.value = search;
    }

    initFilters();
    initSort();
    applyFilters();
}

function updateBreadcrumb(categoryId) {
    const breadcrumb = document.querySelector('.breadcrumb-list');
    if (!breadcrumb) return;

    const categories = window.PharmacieApp.getCategories();
    const category = categories.find(c => c.id === categoryId);

    if (category) {
        breadcrumb.innerHTML = `
            <li><a href="index.html">Accueil</a></li>
            <li>${window.PharmacieApp.escapeHtml(category.nom)}</li>
        `;
    }
}

function updatePageTitle(categoryId) {
    const titleEl = document.querySelector('.category-title h1');
    if (!titleEl) return;

    const categories = window.PharmacieApp.getCategories();
    const category = categories.find(c => c.id === categoryId);

    if (category) {
        titleEl.textContent = category.nom;
        document.title = `${category.nom} - Pharmacie Ghandour`;
    }
}

/* ============================================
   Filtres
   ============================================ */
function initFilters() {
    // Filtre de recherche
    const searchInput = document.querySelector('.search-filter-input');
    if (searchInput) {
        searchInput.addEventListener('input', window.PharmacieApp.debounce(function() {
            FilterState.search = this.value;
            FilterState.page = 1;
            applyFilters();
        }, 300));
    }

    // Filtre de prix
    const priceRange = document.querySelector('.price-range input');
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            FilterState.priceMax = parseInt(this.value) || Infinity;
            updatePriceDisplay(this.value);
        });

        priceRange.addEventListener('change', function() {
            FilterState.page = 1;
            applyFilters();
        });
    }

    // Filtres de marques
    const brandCheckboxes = document.querySelectorAll('.brand-filter');
    brandCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                FilterState.brands.push(this.value);
            } else {
                FilterState.brands = FilterState.brands.filter(b => b !== this.value);
            }
            FilterState.page = 1;
            applyFilters();
        });
    });

    // Filtre en stock
    const stockFilter = document.querySelector('.stock-filter');
    if (stockFilter) {
        stockFilter.addEventListener('change', function() {
            FilterState.inStockOnly = this.checked;
            FilterState.page = 1;
            applyFilters();
        });
    }

    // Bouton réinitialiser
    const resetBtn = document.querySelector('.reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }

    // Toggle filtres mobile
    const filterToggle = document.querySelector('.filter-toggle-btn');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    const filtersOverlay = document.querySelector('.filters-overlay');

    if (filterToggle && filtersSidebar) {
        filterToggle.addEventListener('click', () => {
            filtersSidebar.classList.add('active');
            if (filtersOverlay) filtersOverlay.classList.add('active');
        });

        if (filtersOverlay) {
            filtersOverlay.addEventListener('click', () => {
                filtersSidebar.classList.remove('active');
                filtersOverlay.classList.remove('active');
            });
        }
    }

    // Charger les marques disponibles
    loadAvailableBrands();
}

function loadAvailableBrands() {
    const container = document.querySelector('.brands-list');
    if (!container) return;

    const products = FilterState.category
        ? window.PharmacieApp.getProductsByCategory(FilterState.category)
        : window.PharmacieApp.getProducts();

    const brands = [...new Set(products.map(p => p.marque))].sort();

    container.innerHTML = brands.map(brand => `
        <label class="form-check">
            <input type="checkbox" class="brand-filter" value="${brand}">
            <span>${window.PharmacieApp.escapeHtml(brand)}</span>
        </label>
    `).join('');

    // Réattacher les événements
    container.querySelectorAll('.brand-filter').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                FilterState.brands.push(this.value);
            } else {
                FilterState.brands = FilterState.brands.filter(b => b !== this.value);
            }
            FilterState.page = 1;
            applyFilters();
        });
    });
}

function updatePriceDisplay(value) {
    const display = document.querySelector('.price-max-value');
    if (display) {
        display.textContent = window.PharmacieApp.formatPrice(value);
    }
}

function resetFilters() {
    FilterState.search = '';
    FilterState.priceMin = 0;
    FilterState.priceMax = Infinity;
    FilterState.brands = [];
    FilterState.inStockOnly = false;
    FilterState.page = 1;

    // Réinitialiser les inputs
    const searchInput = document.querySelector('.search-filter-input');
    if (searchInput) searchInput.value = '';

    const priceRange = document.querySelector('.price-range input');
    if (priceRange) {
        priceRange.value = priceRange.max;
        updatePriceDisplay(priceRange.max);
    }

    document.querySelectorAll('.brand-filter').forEach(cb => cb.checked = false);

    const stockFilter = document.querySelector('.stock-filter');
    if (stockFilter) stockFilter.checked = false;

    applyFilters();
}

/* ============================================
   Tri
   ============================================ */
function initSort() {
    const sortSelect = document.querySelector('.sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', function() {
        const [sortBy, sortOrder] = this.value.split('-');
        FilterState.sortBy = sortBy;
        FilterState.sortOrder = sortOrder || 'asc';
        applyFilters();
    });
}

/* ============================================
   Application des filtres
   ============================================ */
function applyFilters() {
    let products = FilterState.category
        ? window.PharmacieApp.getProductsByCategory(FilterState.category)
        : window.PharmacieApp.getProducts();

    // Filtre recherche
    if (FilterState.search) {
        const query = window.PharmacieApp.normalizeText(FilterState.search);
        products = products.filter(p =>
            window.PharmacieApp.normalizeText(p.nom).includes(query) ||
            window.PharmacieApp.normalizeText(p.marque).includes(query) ||
            window.PharmacieApp.normalizeText(p.description).includes(query)
        );
    }

    // Filtre prix
    products = products.filter(p =>
        p.prix >= FilterState.priceMin && p.prix <= FilterState.priceMax
    );

    // Filtre marques
    if (FilterState.brands.length > 0) {
        products = products.filter(p => FilterState.brands.includes(p.marque));
    }

    // Filtre en stock
    if (FilterState.inStockOnly) {
        products = products.filter(p => p.enStock);
    }

    // Tri
    products = sortProducts(products);

    // Mise à jour du compteur
    updateResultsCount(products.length);

    // Pagination
    const totalPages = Math.ceil(products.length / FilterState.perPage);
    const start = (FilterState.page - 1) * FilterState.perPage;
    const paginatedProducts = products.slice(start, start + FilterState.perPage);

    // Affichage
    displayProducts(paginatedProducts);
    displayPagination(totalPages);
}

function sortProducts(products) {
    return [...products].sort((a, b) => {
        let comparison = 0;

        switch (FilterState.sortBy) {
            case 'prix':
                comparison = a.prix - b.prix;
                break;
            case 'nom':
            default:
                comparison = a.nom.localeCompare(b.nom, 'fr');
        }

        return FilterState.sortOrder === 'desc' ? -comparison : comparison;
    });
}

function updateResultsCount(count) {
    const countEl = document.querySelector('.results-count');
    if (countEl) {
        countEl.textContent = `${count} produit${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`;
    }
}

/* ============================================
   Affichage des produits
   ============================================ */
function displayProducts(products) {
    const container = document.getElementById('products-grid');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><span class="icon icon-xl"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span></div>
                <h3>Aucun produit trouvé</h3>
                <p>Essayez de modifier vos filtres ou votre recherche.</p>
                <button class="btn btn-primary" onclick="resetFilters()">Réinitialiser les filtres</button>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => createProductCard(product)).join('');
    attachProductCardEvents(container);
}

function createProductCard(product) {
    const stockClass = product.enStock ? 'in-stock' : 'out-of-stock';
    const stockText = product.enStock ? 'En stock' : 'Rupture de stock';

    let badges = '';
    if (product.prescriptionRequise) {
        badges += '<span class="product-badge prescription">Ordonnance</span>';
    }
    if (product.populaire) {
        badges += '<span class="product-badge">Populaire</span>';
    }
    if (!product.enStock) {
        badges += '<span class="product-badge out-of-stock">Rupture</span>';
    }

    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <a href="produit.html?id=${product.id}">
                    <img src="${product.image}" alt="${window.PharmacieApp.escapeHtml(product.nom)}" loading="lazy">
                </a>
                ${badges}
            </div>
            <div class="product-info">
                <div class="product-category">${window.PharmacieApp.escapeHtml(product.marque)}</div>
                <h3 class="product-name">
                    <a href="produit.html?id=${product.id}">${window.PharmacieApp.escapeHtml(product.nom)}</a>
                </h3>
                <div class="product-price">${window.PharmacieApp.formatPrice(product.prix)}</div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm add-to-cart-btn"
                            data-product-id="${product.id}"
                            ${!product.enStock ? 'disabled' : ''}>
                        ${product.enStock ? '<span class="icon icon-sm"><svg viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg></span> Ajouter' : 'Indisponible'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function attachProductCardEvents(container) {
    const buttons = container.querySelectorAll('.add-to-cart-btn');
    console.log('🔘 Attachement événements sur', buttons.length, 'boutons');

    buttons.forEach((btn, index) => {
        const productId = btn.dataset.productId;
        console.log(`   - Bouton ${index + 1}: ID="${productId}"`);

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ CLIC sur bouton Ajouter au panier!');
            console.log('   - ProductId:', this.dataset.productId);
            addToCart(this.dataset.productId, 1);
        });
    });
}

/* ============================================
   Pagination
   ============================================ */
function displayPagination(totalPages) {
    const container = document.querySelector('.pagination');
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    let html = '';

    // Bouton précédent
    html += `
        <button class="pagination-btn" data-page="${FilterState.page - 1}"
                ${FilterState.page === 1 ? 'disabled' : ''}>
            ‹
        </button>
    `;

    // Pages
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= FilterState.page - 1 && i <= FilterState.page + 1)
        ) {
            html += `
                <button class="pagination-btn ${i === FilterState.page ? 'active' : ''}"
                        data-page="${i}">
                    ${i}
                </button>
            `;
        } else if (i === FilterState.page - 2 || i === FilterState.page + 2) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
    }

    // Bouton suivant
    html += `
        <button class="pagination-btn" data-page="${FilterState.page + 1}"
                ${FilterState.page === totalPages ? 'disabled' : ''}>
            ›
        </button>
    `;

    container.innerHTML = html;

    // Événements
    container.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                FilterState.page = parseInt(this.dataset.page);
                applyFilters();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

/* ============================================
   Page Produit
   ============================================ */
function initProductPage() {
    console.log('========================================');
    console.log('🛍️ INIT PAGE PRODUIT - DÉBUT');
    console.log('========================================');

    // Vérifier si PharmacieApp existe
    console.log('1️⃣ PharmacieApp existe?', !!window.PharmacieApp);
    if (!window.PharmacieApp) {
        console.error('❌ ERREUR: PharmacieApp n\'existe pas!');
        return;
    }

    // Récupérer l'ID du produit
    const productId = window.PharmacieApp.getUrlParam('id');
    console.log('2️⃣ ID du produit dans URL:', productId);
    console.log('2️⃣ URL complète:', window.location.href);
    console.log('2️⃣ Search params:', window.location.search);

    if (!productId) {
        console.warn('⚠️ Pas d\'ID produit dans l\'URL');
        console.log('URL complète:', window.location.href);
        console.log('Search:', window.location.search);
        console.log('❌ ATTENTION: Redirection vers accueil dans 3 secondes...');

        // Afficher un message au lieu de rediriger immédiatement
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="container" style="padding: 2rem; text-align: center;">
                    <h2>Aucun produit sélectionné</h2>
                    <p>L'URL ne contient pas d'ID de produit.</p>
                    <p>URL: ${window.location.href}</p>
                    <p><a href="index.html" class="btn btn-primary">Retour à l'accueil</a></p>
                </div>
            `;
        }

        // Redirection après 3 secondes
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        return;
    }

    // Voir combien de produits sont chargés
    let allProducts = window.PharmacieApp.getProducts();
    console.log('3️⃣ Nombre de produits en mémoire:', allProducts.length);

    // Fallback: utiliser les produits temporaires si disponibles
    if (allProducts.length === 0 && window._tempProducts) {
        console.log('3️⃣ Utilisation des produits temporaires:', window._tempProducts.length);
        allProducts = window._tempProducts;
    }

    if (allProducts.length === 0) {
        console.error('❌ ERREUR: Aucun produit en mémoire!');
        console.log('Les produits n\'ont pas été chargés depuis Sanity');
        console.log('Attendez 3 secondes pour le fallback automatique...');
        displayProductNotFound();
        return;
    }

    // Afficher les 5 premiers IDs pour debug
    console.log('4️⃣ Exemples d\'IDs disponibles:', allProducts.slice(0, 5).map(p => p.id));

    // Chercher le produit
    console.log('5️⃣ Recherche du produit avec ID:', productId);
    let product = window.PharmacieApp.getProductById(productId);
    console.log('   - Résultat getProductById():', product ? product.nom : 'NON TROUVÉ');

    // Si pas trouvé, essayer d'autres méthodes
    if (!product) {
        console.log('6️⃣ Tentative de recherche alternative...');

        // Recherche exacte
        product = allProducts.find(p => p.id === productId);
        console.log('   - Recherche exacte:', product ? 'TROUVÉ' : 'non trouvé');

        // Avec préfixe product-
        if (!product) {
            product = allProducts.find(p => p.id === `product-${productId}`);
            console.log('   - Avec préfixe product-:', product ? 'TROUVÉ' : 'non trouvé');
        }

        // Recherche partielle
        if (!product) {
            product = allProducts.find(p => p.id && p.id.includes(productId));
            console.log('   - Recherche partielle (includes):', product ? 'TROUVÉ' : 'non trouvé');
        }

        // Recherche inverse
        if (!product) {
            product = allProducts.find(p => productId.includes(p.id));
            console.log('   - Recherche inverse:', product ? 'TROUVÉ' : 'non trouvé');
        }
    }

    if (!product) {
        console.error('❌ PRODUIT NON TROUVÉ!');
        console.log('ID recherché:', productId);
        console.log('IDs disponibles:', allProducts.map(p => p.id));
        displayProductNotFound();
        return;
    }

    console.log('✅ PRODUIT TROUVÉ!');
    console.log('   - ID:', product.id);
    console.log('   - Nom:', product.nom);
    console.log('   - Prix:', product.prix);
    console.log('   - Image:', product.image);
    console.log('   - En stock:', product.enStock);

    console.log('7️⃣ Affichage des détails...');
    displayProductDetail(product);

    console.log('8️⃣ Affichage produits similaires...');
    displaySimilarProducts(product);

    console.log('========================================');
    console.log('🛍️ INIT PAGE PRODUIT - FIN');
    console.log('========================================');
}

function displayProductDetail(product) {
    console.log('📝 displayProductDetail() - Début');
    console.log('   - Produit:', product.nom);

    // Mettre à jour le titre
    document.title = `${product.nom} - Pharmacie Ghandour`;
    console.log('   - Titre page mis à jour');

    // Breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb-list');
    if (breadcrumb) {
        const categories = window.PharmacieApp.getCategories();
        const category = categories.find(c => c.id === product.categorie);

        breadcrumb.innerHTML = `
            <li><a href="index.html">Accueil</a></li>
            ${category ? `<li><a href="categorie.html?cat=${category.id}">${window.PharmacieApp.escapeHtml(category.nom)}</a></li>` : ''}
            <li>${window.PharmacieApp.escapeHtml(product.nom)}</li>
        `;
    }

    // Image
    const mainImage = document.querySelector('.product-main-image img');
    if (mainImage) {
        mainImage.src = product.image;
        mainImage.alt = product.nom;
    }

    // Informations
    const nameEl = document.querySelector('.product-detail-info h1');
    if (nameEl) nameEl.textContent = product.nom;

    const priceEl = document.querySelector('.product-detail-price');
    if (priceEl) priceEl.textContent = window.PharmacieApp.formatPrice(product.prix);

    const descEl = document.querySelector('.product-detail-description');
    if (descEl) descEl.textContent = product.description;

    // Posologie
    const posologyEl = document.querySelector('.product-posology');
    if (posologyEl && product.posologie) {
        posologyEl.textContent = product.posologie;
    }

    // Stock
    const stockBadge = document.querySelector('.stock-badge');
    if (stockBadge) {
        stockBadge.className = `stock-badge ${product.enStock ? 'in-stock' : 'out-of-stock'}`;
        stockBadge.innerHTML = product.enStock
            ? '<span class="icon icon-sm"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></span> En stock'
            : '<span class="icon icon-sm"><svg viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span> Rupture de stock';
    }

    // Prescription
    const prescriptionBadge = document.querySelector('.prescription-badge');
    if (prescriptionBadge) {
        prescriptionBadge.style.display = product.prescriptionRequise ? 'block' : 'none';
    }

    // Bouton ajouter au panier
    const addBtn = document.querySelector('.add-to-cart-detail');
    if (addBtn) {
        addBtn.disabled = !product.enStock;
        addBtn.innerHTML = product.enStock ? '<span class="icon icon-sm"><svg viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg></span> Ajouter au panier' : 'Produit indisponible';

        addBtn.addEventListener('click', function() {
            const quantity = parseInt(document.querySelector('.quantity-input')?.value) || 1;
            addToCart(product.id, quantity);
        });
    }

    // Sélecteur de quantité
    initQuantitySelector();

    console.log('📝 displayProductDetail() - FIN (succès)');
}

function initQuantitySelector() {
    console.log('🔢 initQuantitySelector() appelée');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const input = document.querySelector('.quantity-input');

    if (!input) return;

    minusBtn?.addEventListener('click', () => {
        const current = parseInt(input.value) || 1;
        if (current > 1) input.value = current - 1;
    });

    plusBtn?.addEventListener('click', () => {
        const current = parseInt(input.value) || 1;
        if (current < 99) input.value = current + 1;
    });

    input.addEventListener('change', function() {
        let value = parseInt(this.value) || 1;
        if (value < 1) value = 1;
        if (value > 99) value = 99;
        this.value = value;
    });
}

function displaySimilarProducts(currentProduct) {
    const container = document.getElementById('similar-products-grid');
    if (!container) return;

    const similar = window.PharmacieApp.getProductsByCategory(currentProduct.categorie)
        .filter(p => p.id !== currentProduct.id)
        .slice(0, 4);

    if (similar.length === 0) {
        container.closest('.similar-products')?.remove();
        return;
    }

    container.innerHTML = similar.map(product => createProductCard(product)).join('');
    attachProductCardEvents(container);
}

function displayProductNotFound() {
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
            <div class="container">
                <div class="empty-state" style="padding: 4rem 0;">
                    <div class="empty-state-icon"><span class="icon icon-xl"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg></span></div>
                    <h3>Produit introuvable</h3>
                    <p>Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
                    <a href="index.html" class="btn btn-primary">Retour à l'accueil</a>
                </div>
            </div>
        `;
    }
}

/* ============================================
   Ajout au panier (utilisé ici et importé par cart.js)
   ============================================ */
function addToCart(productId, quantity = 1) {
    console.log('========================================');
    console.log('🛒 ADD TO CART - DÉBUT');
    console.log('========================================');
    console.log('1️⃣ ID reçu:', productId);
    console.log('1️⃣ Quantité:', quantity);

    // Vérifier PharmacieApp
    if (!window.PharmacieApp) {
        console.error('❌ ERREUR: PharmacieApp n\'existe pas!');
        alert('Erreur: Application non chargée');
        return;
    }

    // Vérifier les produits
    const allProducts = window.PharmacieApp.getProducts();
    console.log('2️⃣ Produits en mémoire:', allProducts.length);

    if (allProducts.length === 0) {
        console.error('❌ ERREUR: Aucun produit chargé!');
        alert('Erreur: Produits non chargés');
        return;
    }

    // Chercher le produit
    console.log('3️⃣ Recherche du produit...');
    let product = window.PharmacieApp.getProductById(productId);
    console.log('   - getProductById():', product ? product.nom : 'NON TROUVÉ');

    // Si pas trouvé, essayer des correspondances alternatives
    if (!product) {
        console.log('4️⃣ Recherche alternative...');
        product = allProducts.find(p => p.id === productId);
        console.log('   - Exacte:', product ? 'TROUVÉ' : 'non');

        if (!product) {
            product = allProducts.find(p => p.id === `product-${productId}`);
            console.log('   - Avec préfixe:', product ? 'TROUVÉ' : 'non');
        }

        if (!product) {
            product = allProducts.find(p => p.id && p.id.includes(productId));
            console.log('   - Partielle:', product ? 'TROUVÉ' : 'non');
        }
    }

    if (!product) {
        console.error('❌ PRODUIT NON TROUVÉ!');
        console.log('ID recherché:', productId);
        console.log('5 premiers IDs disponibles:', allProducts.slice(0, 5).map(p => p.id));
        window.PharmacieApp.showToast('Erreur: Produit non trouvé', 'error');
        return;
    }

    console.log('✅ Produit trouvé:', product.nom);
    console.log('   - ID réel:', product.id);
    console.log('   - Prix:', product.prix);
    console.log('   - En stock:', product.enStock);

    if (!product.enStock) {
        console.warn('⚠️ Produit en rupture de stock');
        window.PharmacieApp.showToast('Ce produit est en rupture de stock', 'warning');
        return;
    }

    // Récupérer le panier actuel
    console.log('5️⃣ Récupération du panier actuel...');
    const cart = window.PharmacieApp.getCart();
    console.log('   - Panier actuel:', JSON.stringify(cart));

    // Ajouter au panier
    const actualProductId = product.id;
    const existingItem = cart.find(item => item.id === actualProductId);

    if (existingItem) {
        existingItem.quantity += quantity;
        console.log('6️⃣ Quantité mise à jour:', existingItem.quantity);
    } else {
        cart.push({
            id: actualProductId,
            quantity: quantity
        });
        console.log('6️⃣ Nouveau produit ajouté');
    }

    // Sauvegarder
    console.log('7️⃣ Sauvegarde du panier...');
    console.log('   - Nouveau panier:', JSON.stringify(cart));
    window.PharmacieApp.saveCart(cart);

    // Vérifier la sauvegarde
    const savedCart = window.PharmacieApp.getCart();
    console.log('8️⃣ Vérification sauvegarde:', JSON.stringify(savedCart));

    // Notification
    console.log('9️⃣ Affichage notification...');
    window.PharmacieApp.showToast(`${product.nom} ajouté au panier`, 'success');

    console.log('========================================');
    console.log('🛒 ADD TO CART - FIN (SUCCÈS)');
    console.log('========================================');
}

// Export pour utilisation globale
window.addToCart = addToCart;
window.resetFilters = resetFilters;
