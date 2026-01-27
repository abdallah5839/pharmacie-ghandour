/**
 * Script d'importation des données JSON vers Sanity
 *
 * Usage:
 * 1. Créer un token API sur https://www.sanity.io/manage/project/ir1xi4z1/api
 * 2. Exécuter: SANITY_TOKEN=votre_token node scripts/import-data.js
 */

const fs = require('fs');
const path = require('path');

const SANITY_PROJECT_ID = 'ir1xi4z1';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-26';

// Lire le token depuis les variables d'environnement
const SANITY_TOKEN = process.env.SANITY_TOKEN;

if (!SANITY_TOKEN) {
    console.error('❌ ERREUR: Variable SANITY_TOKEN non définie');
    console.log('');
    console.log('Instructions:');
    console.log('1. Allez sur https://www.sanity.io/manage/project/ir1xi4z1/api');
    console.log('2. Cliquez sur "Add API token"');
    console.log('3. Nom: "Import Script", Permissions: "Editor"');
    console.log('4. Copiez le token et exécutez:');
    console.log('   SANITY_TOKEN=votre_token node scripts/import-data.js');
    process.exit(1);
}

const API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}`;

// Charger les données JSON
const dataPath = path.join(__dirname, '../../data/products.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Générer un slug depuis un texte
function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Envoyer les mutations à Sanity
async function sendMutations(mutations, label) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SANITY_TOKEN}`
            },
            body: JSON.stringify({ mutations })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error(`❌ Erreur ${label}:`, result);
            return false;
        }

        console.log(`✅ ${label}: ${mutations.length} éléments importés`);
        return true;
    } catch (error) {
        console.error(`❌ Erreur ${label}:`, error.message);
        return false;
    }
}

async function importCategories() {
    console.log('\n📁 Import des catégories...');

    const mutations = data.categories.map((cat, index) => ({
        createOrReplace: {
            _id: `category-${cat.id}`,
            _type: 'category',
            nom: cat.nom,
            slug: {
                _type: 'slug',
                current: cat.id
            },
            description: cat.description || '',
            icon: cat.icon || 'package',
            ordre: index,
            active: true,
            afficherAccueil: true
        }
    }));

    return sendMutations(mutations, 'Catégories');
}

async function importProducts() {
    console.log('\n📦 Import des produits...');

    const mutations = data.products.map(prod => ({
        createOrReplace: {
            _id: `product-${prod.id}`,
            _type: 'product',
            nom: prod.nom,
            slug: {
                _type: 'slug',
                current: generateSlug(prod.nom)
            },
            categorie: {
                _type: 'reference',
                _ref: `category-${prod.categorie}`
            },
            marque: prod.marque || '',
            prix: prod.prix,
            // Note: les images URL externes ne peuvent pas être importées directement
            // Elles devront être uploadées manuellement via le Studio
            description: prod.description || '',
            posologie: prod.posologie || '',
            prescriptionRequise: prod.prescriptionRequise || false,
            enStock: prod.enStock !== false,
            populaire: prod.populaire || false,
            statut: 'publie'
        }
    }));

    return sendMutations(mutations, 'Produits');
}

async function main() {
    console.log('🚀 Début de l\'importation vers Sanity');
    console.log(`   Project: ${SANITY_PROJECT_ID}`);
    console.log(`   Dataset: ${SANITY_DATASET}`);
    console.log(`   Catégories: ${data.categories.length}`);
    console.log(`   Produits: ${data.products.length}`);

    // Importer les catégories d'abord (car les produits y font référence)
    const catSuccess = await importCategories();
    if (!catSuccess) {
        console.log('\n⚠️ Erreur lors de l\'import des catégories');
    }

    // Attendre un peu pour que Sanity indexe les catégories
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Importer les produits
    const prodSuccess = await importProducts();
    if (!prodSuccess) {
        console.log('\n⚠️ Erreur lors de l\'import des produits');
    }

    console.log('\n✨ Importation terminée!');
    console.log('');
    console.log('Prochaines étapes:');
    console.log('1. Ouvrez Sanity Studio: npm run dev');
    console.log('2. Ajoutez les images des produits manuellement');
    console.log('3. Vérifiez que toutes les données sont correctes');
}

main().catch(console.error);
