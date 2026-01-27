export default {
  name: 'order',
  title: 'Commande',
  type: 'document',
  fields: [
    {
      name: 'numeroCommande',
      title: 'Numéro de commande',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'dateCommande',
      title: 'Date de commande',
      type: 'datetime'
    },
    {
      name: 'statut',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          {title: 'En attente', value: 'en_attente'},
          {title: 'Confirmée', value: 'confirmee'},
          {title: 'En préparation', value: 'en_preparation'},
          {title: 'Prête', value: 'prete'},
          {title: 'Récupérée', value: 'recuperee'},
          {title: 'Annulée', value: 'annulee'}
        ],
        layout: 'dropdown'
      },
      initialValue: 'en_attente'
    },
    {
      name: 'client',
      title: 'Client',
      type: 'object',
      fields: [
        {name: 'nom', title: 'Nom', type: 'string'},
        {name: 'telephone', title: 'Téléphone', type: 'string'},
        {name: 'email', title: 'Email', type: 'string'}
      ]
    },
    {
      name: 'produits',
      title: 'Produits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'produit',
              title: 'Produit',
              type: 'reference',
              to: [{type: 'product'}]
            },
            {
              name: 'nomProduit',
              title: 'Nom du produit',
              type: 'string'
            },
            {
              name: 'quantite',
              title: 'Quantité',
              type: 'number'
            },
            {
              name: 'prixUnitaire',
              title: 'Prix unitaire',
              type: 'number'
            }
          ],
          preview: {
            select: {
              title: 'nomProduit',
              qty: 'quantite',
              prix: 'prixUnitaire'
            },
            prepare({title, qty, prix}) {
              return {
                title: title || 'Produit',
                subtitle: `${qty}x - ${prix} FCFA`
              }
            }
          }
        }
      ]
    },
    {
      name: 'total',
      title: 'Total (FCFA)',
      type: 'number'
    },
    {
      name: 'dateRetrait',
      title: 'Date de retrait souhaitée',
      type: 'date'
    },
    {
      name: 'heureRetrait',
      title: 'Heure de retrait souhaitée',
      type: 'string'
    },
    {
      name: 'commentaires',
      title: 'Commentaires',
      type: 'text'
    }
  ],
  preview: {
    select: {
      title: 'numeroCommande',
      client: 'client.nom',
      statut: 'statut',
      total: 'total'
    },
    prepare({title, client, statut, total}) {
      return {
        title: title || 'Commande',
        subtitle: `${client || 'Client inconnu'} - ${total || 0} FCFA - ${statut || 'en_attente'}`
      }
    }
  },
  orderings: [
    {
      title: 'Date (récent)',
      name: 'dateDesc',
      by: [{field: 'dateCommande', direction: 'desc'}]
    }
  ]
}
