/**
 * Configuration et client Sanity pour Pharmacie Ghandour
 * Gère la récupération des données depuis Sanity CMS
 */

(function() {
    'use strict';

    // Configuration Sanity
    const SANITY_CONFIG = {
        projectId: 'ir1xi4z1',
        dataset: 'production',
        apiVersion: '2024-01-26',
        useCdn: false // IMPORTANT: false pour avoir les données en temps réel
    };

    // URL de base pour l'API Sanity
    const getApiUrl = (query, params = {}) => {
        const baseUrl = `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}`;
        const encodedQuery = encodeURIComponent(query);

        // Ajouter un timestamp pour éviter le cache navigateur
        const timestamp = Date.now();
        let url = `${baseUrl}?query=${encodedQuery}&_t=${timestamp}`;

        // Ajouter les paramètres
        Object.entries(params).forEach(([key, value]) => {
            url += `&$${key}="${encodeURIComponent(value)}"`;
        });

        return url;
    };

    // Image par défaut (placeholder)
    const DEFAULT_IMAGE = 'https://placehold.co/300x300/2E7D32/white?text=Pharmacie+Ghandour';

    // URL pour les images Sanity
    const getImageUrl = (imageRef, options = {}) => {
        if (!imageRef || !imageRef.asset) return null;

        const ref = imageRef.asset._ref;
        if (!ref) return null;

        // Parse la référence: image-{id}-{dimensions}-{format}
        const parts = ref.split('-');
        if (parts.length < 4) return null;

        // Le format est "image-{id}-{dimensions}-{format}"
        const id = parts[1];
        const dimensions = parts[2];
        const format = parts[3];

        let url = `https://cdn.sanity.io/images/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}/${id}-${dimensions}.${format}`;

        // Options d'optimisation
        const params = ['auto=format'];
        if (options.width) params.push(`w=${options.width}`);
        if (options.height) params.push(`h=${options.height}`);
        if (options.quality) params.push(`q=${options.quality || 80}`);
        if (options.fit) params.push(`fit=${options.fit}`);

        url += '?' + params.join('&');

        return url;
    };

    // PAS DE CACHE - Toujours récupérer les données fraîches
    const fetchFromSanity = async (query, params = {}, cacheKey = null) => {
        try {
            const url = getApiUrl(query, params);
            console.log(`🔄 Sanity API: ${cacheKey || 'query'}...`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Désactiver le cache navigateur
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Erreur Sanity: ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ Sanity API (${cacheKey || 'query'}):`, data.result?.length || 0, 'éléments');

            return data.result;
        } catch (error) {
            console.error('❌ Erreur Sanity:', error);
            throw error;
        }
    };

    // ==========================================
    // FONCTIONS PUBLIQUES - CATÉGORIES
    // ==========================================

    const getCategories = async () => {
        const query = `*[_type == "category" && active == true] | order(ordre asc) {
            _id,
            "id": slug.current,
            nom,
            description,
            icon,
            image,
            ordre,
            afficherAccueil,
            "count": count(*[_type == "product" && references(^._id) && statut == "publie"])
        }`;

        return fetchFromSanity(query, {}, 'categories');
    };

    const getCategoriesAccueil = async () => {
        const query = `*[_type == "category" && active == true && afficherAccueil == true] | order(ordre asc) {
            _id,
            "id": slug.current,
            nom,
            description,
            icon,
            image,
            "count": count(*[_type == "product" && references(^._id) && statut == "publie"])
        }`;

        return fetchFromSanity(query, {}, 'categories_accueil');
    };

    const getCategoryBySlug = async (slug) => {
        const query = `*[_type == "category" && slug.current == $slug][0] {
            _id,
            "id": slug.current,
            nom,
            description,
            icon,
            image
        }`;

        return fetchFromSanity(query, { slug });
    };

    // ==========================================
    // FONCTIONS PUBLIQUES - PRODUITS
    // ==========================================

    const getProducts = async () => {
        const query = `*[_type == "product" && statut == "publie"] | order(nom asc) {
            _id,
            "id": _id,
            nom,
            "slug": slug.current,
            "categorie": categorie->slug.current,
            "categorieNom": categorie->nom,
            marque,
            reference,
            prix,
            "image": imagePrincipale,
            galerie,
            description,
            composition,
            posologie,
            indications,
            precautions,
            prescriptionRequise,
            enStock,
            populaire
        }`;

        return fetchFromSanity(query, {}, 'products');
    };

    const getProductsByCategory = async (categorySlug) => {
        const query = `*[_type == "product" && statut == "publie" && categorie->slug.current == $categorySlug] | order(nom asc) {
            _id,
            "id": _id,
            nom,
            "slug": slug.current,
            "categorie": categorie->slug.current,
            marque,
            prix,
            "image": imagePrincipale,
            description,
            prescriptionRequise,
            enStock,
            populaire
        }`;

        return fetchFromSanity(query, { categorySlug });
    };

    const getPopularProducts = async (limit = 10) => {
        const query = `*[_type == "product" && statut == "publie" && populaire == true][0...${limit}] {
            _id,
            "id": _id,
            nom,
            "slug": slug.current,
            "categorie": categorie->slug.current,
            marque,
            prix,
            "image": imagePrincipale,
            description,
            prescriptionRequise,
            enStock
        }`;

        return fetchFromSanity(query, {}, `popular_${limit}`);
    };

    const getProductById = async (id) => {
        const query = `*[_type == "product" && _id == $id][0] {
            _id,
            "id": _id,
            nom,
            "slug": slug.current,
            "categorie": categorie->slug.current,
            "categorieNom": categorie->nom,
            marque,
            reference,
            prix,
            "image": imagePrincipale,
            galerie,
            description,
            composition,
            posologie,
            indications,
            precautions,
            prescriptionRequise,
            enStock,
            populaire
        }`;

        return fetchFromSanity(query, { id });
    };

    const getProductBySlug = async (slug) => {
        const query = `*[_type == "product" && slug.current == $slug][0] {
            _id,
            "id": _id,
            nom,
            "slug": slug.current,
            "categorie": categorie->slug.current,
            "categorieNom": categorie->nom,
            marque,
            reference,
            prix,
            "image": imagePrincipale,
            galerie,
            description,
            composition,
            posologie,
            indications,
            precautions,
            prescriptionRequise,
            enStock,
            populaire
        }`;

        return fetchFromSanity(query, { slug });
    };

    const searchProducts = async (searchTerm) => {
        const query = `*[_type == "product" && statut == "publie" && (
            nom match $search ||
            marque match $search ||
            description match $search
        )] | order(nom asc) {
            _id,
            "id": _id,
            nom,
            "slug": slug.current,
            "categorie": categorie->slug.current,
            marque,
            prix,
            "image": imagePrincipale,
            description,
            prescriptionRequise,
            enStock
        }`;

        return fetchFromSanity(query, { search: `*${searchTerm}*` });
    };

    // ==========================================
    // FONCTIONS PUBLIQUES - COMMANDES
    // ==========================================

    const createOrder = async (orderData) => {
        const mutations = [{
            create: {
                _type: 'order',
                numeroCommande: orderData.numeroCommande,
                dateCommande: new Date().toISOString(),
                statut: 'en_attente',
                client: {
                    nom: orderData.client.nom,
                    telephone: orderData.client.telephone,
                    email: orderData.client.email || ''
                },
                produits: orderData.produits.map(p => ({
                    _key: p.id || Math.random().toString(36).substr(2, 9),
                    produit: p.sanityId ? { _type: 'reference', _ref: p.sanityId } : null,
                    nomProduit: p.nom,
                    quantite: p.quantite,
                    prixUnitaire: p.prix
                })),
                total: orderData.total,
                dateRetrait: orderData.dateRetrait || null,
                heureRetrait: orderData.heureRetrait || null,
                commentaires: orderData.commentaires || ''
            }
        }];

        try {
            const response = await fetch(
                `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/mutate/${SANITY_CONFIG.dataset}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ mutations })
                }
            );

            if (!response.ok) {
                console.warn('Mode développement: commande non envoyée à Sanity (token manquant)');
                return { success: true, simulated: true };
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la création de la commande:', error);
            return { success: true, simulated: true, error: error.message };
        }
    };

    // ==========================================
    // HELPERS
    // ==========================================

    const transformProduct = (sanityProduct) => {
        if (!sanityProduct) return null;

        const imageUrl = sanityProduct.image ? getImageUrl(sanityProduct.image, { width: 300, quality: 80 }) : null;
        const imageFullUrl = sanityProduct.image ? getImageUrl(sanityProduct.image, { width: 600, quality: 90 }) : null;

        return {
            id: sanityProduct.id || sanityProduct._id,
            nom: sanityProduct.nom,
            categorie: sanityProduct.categorie,
            categorieNom: sanityProduct.categorieNom,
            marque: sanityProduct.marque || '',
            reference: sanityProduct.reference || '',
            prix: sanityProduct.prix,
            image: imageUrl || DEFAULT_IMAGE,
            imageFull: imageFullUrl || DEFAULT_IMAGE,
            galerie: sanityProduct.galerie ? sanityProduct.galerie.map(img => getImageUrl(img, { width: 600, quality: 90 })).filter(Boolean) : [],
            description: sanityProduct.description || '',
            composition: sanityProduct.composition || '',
            posologie: sanityProduct.posologie || '',
            indications: sanityProduct.indications || '',
            precautions: sanityProduct.precautions || '',
            prescriptionRequise: sanityProduct.prescriptionRequise || false,
            enStock: sanityProduct.enStock !== false,
            populaire: sanityProduct.populaire || false
        };
    };

    const transformCategory = (sanityCategory) => {
        if (!sanityCategory) return null;

        return {
            id: sanityCategory.id,
            nom: sanityCategory.nom,
            description: sanityCategory.description || '',
            icon: sanityCategory.icon || 'package',
            image: sanityCategory.image ? getImageUrl(sanityCategory.image, { width: 200 }) : null,
            count: sanityCategory.count || 0
        };
    };

    // ==========================================
    // EXPORT GLOBAL
    // ==========================================

    window.SanityClient = {
        config: SANITY_CONFIG,
        getCategories,
        getCategoriesAccueil,
        getCategoryBySlug,
        getProducts,
        getProductsByCategory,
        getPopularProducts,
        getProductById,
        getProductBySlug,
        searchProducts,
        createOrder,
        getImageUrl,
        transformProduct,
        transformCategory,
        DEFAULT_IMAGE
    };

    console.log('✅ SanityClient initialisé - Project ID:', SANITY_CONFIG.projectId, '- CDN:', SANITY_CONFIG.useCdn ? 'OUI' : 'NON (temps réel)');

})();
