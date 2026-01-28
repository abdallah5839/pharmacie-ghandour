# Sanity Studio - Pharmacie Ghandour

Interface d'administration pour gérer les produits, catégories et commandes de la pharmacie.

## Configuration

- **Project ID**: `ir1xi4z1`
- **Dataset**: `production`
- **URL Studio**: https://pharmacie-ghandour-cms.sanity.studio (après déploiement)

## Démarrage local

```bash
cd sanity-studio
npm install
npm run dev
```

Le studio sera accessible sur http://localhost:3333

## Structure des données

### Catégories
- Nom, slug, description
- Icône (Lucide icons)
- Ordre d'affichage
- Active / Afficher sur l'accueil

### Produits
- Nom, slug, marque, référence
- Catégorie (référence)
- Prix (FCFA)
- Image principale + galerie
- Description, composition, posologie, indications, précautions
- Ordonnance requise, en stock, produit vedette
- Statut (publié/brouillon)

### Commandes
- Numéro de commande (auto-généré)
- Date/heure de commande
- Statut (en attente, confirmée, prête, récupérée, annulée)
- Informations client (nom, téléphone, email)
- Produits commandés avec quantités et prix
- Total, date/heure de retrait, commentaires

## Import des données existantes

1. Créer un token API sur https://www.sanity.io/manage/project/ir1xi4z1/api
2. Exécuter le script d'import:

```bash
cd sanity-studio
SANITY_TOKEN=votre_token node scripts/import-data.js
```

## Ajouter des images aux produits

Les images doivent être ajoutées manuellement via Sanity Studio:

1. Ouvrir un produit dans le Studio
2. Cliquer sur "Image principale"
3. Glisser-déposer une image ou cliquer pour sélectionner
4. Répéter pour la galerie si nécessaire
5. Publier le document

Les images sont automatiquement optimisées et servies via le CDN Sanity.

## Déploiement du Studio

```bash
npm run deploy
```

Le studio sera déployé sur https://pharmacie-ghandour-cms.sanity.studio

## Gestion des commandes

1. Les commandes apparaissent automatiquement dans le Studio
2. Mettre à jour le statut selon l'avancement:
   - **En attente**: Nouvelle commande reçue
   - **Confirmée**: Commande validée par la pharmacie
   - **Prête**: Commande préparée, prête pour retrait
   - **Récupérée**: Client a récupéré sa commande
   - **Annulée**: Commande annulée

## Variables d'environnement (Production)

Pour le site web en production, créer un fichier `.env` ou configurer dans Netlify/Vercel:

```
SANITY_PROJECT_ID=ir1xi4z1
SANITY_DATASET=production
```

## Support

- Documentation Sanity: https://www.sanity.io/docs
- Gestion projet: https://www.sanity.io/manage/project/ir1xi4z1
