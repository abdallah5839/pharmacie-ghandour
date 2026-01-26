/* ============================================
   PHARMACIE GHANDOUR - Carrousels et Menu Déroulant
   ============================================ */

// Configuration des carrousels
const CAROUSEL_CONFIG = {
    autoScrollDelay: 4000,  // Délai entre chaque scroll automatique (ms)
    itemsPerView: 4,        // Nombre d'items visibles (desktop)
    transitionDuration: 500, // Durée de la transition (ms)
    mobileBreakpoint: 480   // Seuil pour le mode mobile
};

// Détecter si on est sur mobile
function isMobileView() {
    return window.innerWidth <= CAROUSEL_CONFIG.mobileBreakpoint;
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    initDropdownMenu();

    // Attendre le chargement des produits
    if (window.PharmacieApp && window.PharmacieApp.getProducts().length > 0) {
        initCarousels();
    } else {
        document.addEventListener('productsLoaded', initCarousels);
    }
});

/* ============================================
   Menu Déroulant Catégories
   ============================================ */
function initDropdownMenu() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        const menu = dropdown.querySelector('.nav-dropdown-menu');

        if (!toggle || !menu) return;

        // Clic sur le bouton toggle
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const isOpen = dropdown.classList.contains('active');

            // Fermer tous les autres dropdowns
            document.querySelectorAll('.nav-dropdown.active').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });

            // Toggle le dropdown actuel
            dropdown.classList.toggle('active', !isOpen);
        });

        // Fermer si on clique en dehors
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });

        // Fermer avec Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                dropdown.classList.remove('active');
            }
        });
    });

    // Charger les catégories dans le dropdown
    loadCategoriesDropdown();
}

function loadCategoriesDropdown() {
    // Attendre le chargement des données
    const tryLoad = () => {
        const categories = window.PharmacieApp?.getCategories() || [];
        const dropdown = document.getElementById('categories-dropdown');

        if (!dropdown) return;

        if (categories.length === 0) {
            // Réessayer si les données ne sont pas encore chargées
            setTimeout(tryLoad, 100);
            return;
        }

        dropdown.innerHTML = `
            <a href="categorie.html">
                <span class="icon">🏪</span>
                <span>Tous les produits</span>
            </a>
            ${categories.map(cat => `
                <a href="categorie.html?cat=${cat.id}">
                    <span class="icon">${cat.icon}</span>
                    <span>${window.PharmacieApp.escapeHtml(cat.nom)}</span>
                </a>
            `).join('')}
        `;
    };

    tryLoad();
}

/* ============================================
   Carrousels de Produits
   ============================================ */
function initCarousels() {
    // Carrousel 1: Les Plus Achetés (produits populaires, multi-catégories)
    const popularProducts = window.PharmacieApp.getPopularProducts();
    initCarousel('carousel-popular', popularProducts.slice(0, 8));

    // Carrousel 2: Médicaments
    const medicaments = window.PharmacieApp.getProductsByCategory('medicaments');
    initCarousel('carousel-medicaments', medicaments.slice(0, 8));

    // Carrousel 3: Beauté (soin-visage + soin-corps)
    const beautyProducts = [
        ...window.PharmacieApp.getProductsByCategory('soin-visage'),
        ...window.PharmacieApp.getProductsByCategory('soin-corps')
    ].slice(0, 8);
    initCarousel('carousel-beaute', beautyProducts);
}

function initCarousel(carouselId, products) {
    const carousel = document.getElementById(carouselId);
    if (!carousel || products.length === 0) return;

    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    const indicatorsContainer = carousel.querySelector('.carousel-indicators');

    // État du carrousel
    const state = {
        currentIndex: 0,
        isAutoScrolling: true,
        autoScrollInterval: null,
        itemsPerView: getItemsPerView()
    };

    // Calculer le nombre d'items visibles selon la largeur
    function getItemsPerView() {
        const width = window.innerWidth;
        if (width < 480) return 1;
        if (width < 768) return 2;
        if (width < 1024) return 3;
        return 4;
    }

    // Générer les cartes produits
    track.innerHTML = products.map(product => createCarouselCard(product)).join('');

    // Attacher les événements d'ajout au panier
    track.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            if (window.addToCart) {
                window.addToCart(productId, 1);
            }
        });
    });

    // Créer les indicateurs
    const totalSlides = Math.ceil(products.length / state.itemsPerView);
    indicatorsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const indicator = document.createElement('button');
        indicator.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
        indicator.setAttribute('aria-label', `Aller au slide ${i + 1}`);
        indicator.addEventListener('click', () => goToSlide(i));
        indicatorsContainer.appendChild(indicator);
    }

    // Fonction pour aller à un slide spécifique
    function goToSlide(index) {
        const maxIndex = Math.max(0, products.length - state.itemsPerView);
        state.currentIndex = Math.max(0, Math.min(index * state.itemsPerView, maxIndex));
        updateCarousel();
    }

    // Fonction pour mettre à jour l'affichage
    function updateCarousel() {
        const cards = track.querySelectorAll('.product-card');
        const cardWidth = cards[0]?.offsetWidth || 250;
        const gap = isMobileView() ? 16 : 24; // var(--spacing-md) ou var(--spacing-lg)

        if (isMobileView()) {
            // Sur mobile: utiliser le scroll natif
            const container = carousel.querySelector('.carousel-container');
            const scrollPosition = state.currentIndex * (cardWidth + gap);
            container.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        } else {
            // Sur desktop: utiliser transform
            const offset = state.currentIndex * (cardWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
        }

        // Mettre à jour les boutons
        prevBtn.disabled = state.currentIndex === 0;
        nextBtn.disabled = state.currentIndex >= products.length - state.itemsPerView;

        // Mettre à jour les indicateurs
        const activeIndicatorIndex = Math.floor(state.currentIndex / state.itemsPerView);
        indicatorsContainer.querySelectorAll('.carousel-indicator').forEach((ind, i) => {
            ind.classList.toggle('active', i === activeIndicatorIndex);
        });
    }

    // Observer le scroll natif sur mobile pour mettre à jour les indicateurs
    if (isMobileView()) {
        const container = carousel.querySelector('.carousel-container');
        let scrollTimeout;
        container.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const cards = track.querySelectorAll('.product-card');
                const cardWidth = cards[0]?.offsetWidth || 250;
                const gap = 16;
                const scrollLeft = container.scrollLeft;
                const newIndex = Math.round(scrollLeft / (cardWidth + gap));
                if (newIndex !== state.currentIndex) {
                    state.currentIndex = newIndex;
                    // Mettre à jour les indicateurs
                    const activeIndicatorIndex = Math.floor(state.currentIndex / state.itemsPerView);
                    indicatorsContainer.querySelectorAll('.carousel-indicator').forEach((ind, i) => {
                        ind.classList.toggle('active', i === activeIndicatorIndex);
                    });
                }
            }, 100);
        }, { passive: true });
    }

    // Navigation précédent
    prevBtn.addEventListener('click', () => {
        if (state.currentIndex > 0) {
            state.currentIndex--;
            updateCarousel();
            resetAutoScroll();
        }
    });

    // Navigation suivant
    nextBtn.addEventListener('click', () => {
        if (state.currentIndex < products.length - state.itemsPerView) {
            state.currentIndex++;
            updateCarousel();
            resetAutoScroll();
        }
    });

    // Auto-scroll (désactivé sur mobile pour laisser l'utilisateur swiper)
    function startAutoScroll() {
        // Pas d'auto-scroll sur mobile
        if (isMobileView()) return;

        if (state.autoScrollInterval) clearInterval(state.autoScrollInterval);

        state.autoScrollInterval = setInterval(() => {
            if (!state.isAutoScrolling) return;

            if (state.currentIndex < products.length - state.itemsPerView) {
                state.currentIndex++;
            } else {
                state.currentIndex = 0;
            }
            updateCarousel();
        }, CAROUSEL_CONFIG.autoScrollDelay);
    }

    function resetAutoScroll() {
        startAutoScroll();
    }

    // Pause au survol
    carousel.addEventListener('mouseenter', () => {
        state.isAutoScrolling = false;
    });

    carousel.addEventListener('mouseleave', () => {
        state.isAutoScrolling = true;
    });

    // Touch support pour mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        state.isAutoScrolling = false;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        state.isAutoScrolling = true;
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (diff > swipeThreshold && state.currentIndex < products.length - state.itemsPerView) {
            state.currentIndex++;
            updateCarousel();
        } else if (diff < -swipeThreshold && state.currentIndex > 0) {
            state.currentIndex--;
            updateCarousel();
        }
    }

    // Responsive: mettre à jour itemsPerView au resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newItemsPerView = getItemsPerView();
            if (newItemsPerView !== state.itemsPerView) {
                state.itemsPerView = newItemsPerView;
                state.currentIndex = 0;

                // Recréer les indicateurs
                const totalSlides = Math.ceil(products.length / state.itemsPerView);
                indicatorsContainer.innerHTML = '';
                for (let i = 0; i < totalSlides; i++) {
                    const indicator = document.createElement('button');
                    indicator.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
                    indicator.setAttribute('aria-label', `Aller au slide ${i + 1}`);
                    indicator.addEventListener('click', () => goToSlide(i));
                    indicatorsContainer.appendChild(indicator);
                }

                updateCarousel();
            }
        }, 200);
    });

    // Initialiser
    updateCarousel();
    startAutoScroll();
}

function createCarouselCard(product) {
    let badges = '';
    if (product.prescriptionRequise) {
        badges += '<span class="product-badge prescription">Ordonnance</span>';
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
                        ${product.enStock ? '🛒 Ajouter' : 'Indisponible'}
                    </button>
                </div>
            </div>
        </div>
    `;
}
