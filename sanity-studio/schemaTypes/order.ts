import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'order',
  title: 'Commande',
  type: 'document',
  fields: [
    defineField({
      name: 'numeroCommande',
      title: 'Numéro de commande',
      type: 'string',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dateCommande',
      title: 'Date de commande',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'statut',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          {title: 'En attente', value: 'en_attente'},
          {title: 'Confirmée', value: 'confirmee'},
          {title: 'Prête', value: 'prete'},
          {title: 'Récupérée', value: 'recuperee'},
          {title: 'Annulée', value: 'annulee'},
        ],
        layout: 'radio',
      },
      initialValue: 'en_attente',
    }),
    defineField({
      name: 'client',
      title: 'Informations client',
      type: 'object',
      fields: [
        defineField({
          name: 'nom',
          title: 'Nom complet',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'telephone',
          title: 'Téléphone',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'produits',
      title: 'Produits commandés',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'produit',
              title: 'Produit',
              type: 'reference',
              to: [{type: 'product'}],
            }),
            defineField({
              name: 'nomProduit',
              title: 'Nom du produit',
              type: 'string',
              description: 'Sauvegardé pour historique même si le produit est supprimé',
            }),
            defineField({
              name: 'quantite',
              title: 'Quantité',
              type: 'number',
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: 'prixUnitaire',
              title: 'Prix unitaire (FCFA)',
              type: 'number',
            }),
          ],
          preview: {
            select: {
              title: 'nomProduit',
              quantite: 'quantite',
              prix: 'prixUnitaire',
            },
            prepare({title, quantite, prix}) {
              return {
                title: title || 'Produit',
                subtitle: `${quantite}x - ${((prix || 0) * (quantite || 1)).toLocaleString('fr-FR')} FCFA`,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'total',
      title: 'Total (FCFA)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'dateRetrait',
      title: 'Date de retrait souhaitée',
      type: 'date',
    }),
    defineField({
      name: 'heureRetrait',
      title: 'Heure de retrait souhaitée',
      type: 'string',
      options: {
        list: [
          {title: 'Matin (8h-12h)', value: 'matin'},
          {title: 'Après-midi (14h-18h)', value: 'apres-midi'},
          {title: 'Soir (18h-20h)', value: 'soir'},
        ],
      },
    }),
    defineField({
      name: 'commentaires',
      title: 'Commentaires',
      type: 'text',
      rows: 3,
      description: 'Notes ou instructions spéciales du client',
    }),
    defineField({
      name: 'notesInternes',
      title: 'Notes internes',
      type: 'text',
      rows: 3,
      description: 'Notes visibles uniquement par le personnel',
    }),
  ],
  preview: {
    select: {
      title: 'numeroCommande',
      clientNom: 'client.nom',
      total: 'total',
      statut: 'statut',
      date: 'dateCommande',
    },
    prepare({title, clientNom, total, statut, date}) {
      const statusLabels: Record<string, string> = {
        en_attente: '⏳ En attente',
        confirmee: '✅ Confirmée',
        prete: '📦 Prête',
        recuperee: '✔️ Récupérée',
        annulee: '❌ Annulée',
      }
      const dateStr = date ? new Date(date).toLocaleDateString('fr-FR') : ''
      return {
        title: `${title} - ${clientNom || 'Client'}`,
        subtitle: `${statusLabels[statut] || statut} | ${total?.toLocaleString('fr-FR')} FCFA | ${dateStr}`,
      }
    },
  },
  orderings: [
    {
      title: 'Plus récentes',
      name: 'dateDesc',
      by: [{field: 'dateCommande', direction: 'desc'}],
    },
    {
      title: 'Numéro de commande',
      name: 'numeroAsc',
      by: [{field: 'numeroCommande', direction: 'asc'}],
    },
    {
      title: 'Statut',
      name: 'statutAsc',
      by: [{field: 'statut', direction: 'asc'}],
    },
  ],
})
