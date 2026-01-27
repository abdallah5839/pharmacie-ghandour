import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Produit',
  type: 'document',
  fields: [
    defineField({
      name: 'nom',
      title: 'Nom du produit',
      type: 'string',
      validation: (Rule) => Rule.required().error('Le nom est obligatoire'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'nom',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('Le slug est obligatoire'),
    }),
    defineField({
      name: 'categorie',
      title: 'Catégorie',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (Rule) => Rule.required().error('La catégorie est obligatoire'),
    }),
    defineField({
      name: 'marque',
      title: 'Marque',
      type: 'string',
    }),
    defineField({
      name: 'reference',
      title: 'Référence produit',
      type: 'string',
      description: 'Code ou référence interne du produit',
    }),
    defineField({
      name: 'prix',
      title: 'Prix (FCFA)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0).error('Le prix est obligatoire'),
    }),
    defineField({
      name: 'imagePrincipale',
      title: 'Image principale',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().error('L\'image principale est obligatoire'),
    }),
    defineField({
      name: 'galerie',
      title: 'Galerie d\'images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'composition',
      title: 'Composition',
      type: 'text',
      rows: 3,
      description: 'Ingrédients et principes actifs',
    }),
    defineField({
      name: 'posologie',
      title: 'Posologie / Mode d\'emploi',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'indications',
      title: 'Indications',
      type: 'text',
      rows: 3,
      description: 'Dans quels cas utiliser ce produit',
    }),
    defineField({
      name: 'precautions',
      title: 'Précautions d\'emploi',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'prescriptionRequise',
      title: 'Ordonnance requise',
      type: 'boolean',
      initialValue: false,
      description: 'Ce produit nécessite-t-il une ordonnance ?',
    }),
    defineField({
      name: 'enStock',
      title: 'En stock',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'populaire',
      title: 'Produit vedette',
      type: 'boolean',
      initialValue: false,
      description: 'Afficher dans le carrousel "Plus Achetés"',
    }),
    defineField({
      name: 'statut',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          {title: 'Publié', value: 'publie'},
          {title: 'Brouillon', value: 'brouillon'},
        ],
        layout: 'radio',
      },
      initialValue: 'publie',
    }),
  ],
  preview: {
    select: {
      title: 'nom',
      subtitle: 'marque',
      media: 'imagePrincipale',
      prix: 'prix',
      enStock: 'enStock',
    },
    prepare({title, subtitle, media, prix, enStock}) {
      return {
        title,
        subtitle: `${subtitle || 'Sans marque'} - ${prix?.toLocaleString('fr-FR')} FCFA ${!enStock ? '(Rupture)' : ''}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Nom A-Z',
      name: 'nomAsc',
      by: [{field: 'nom', direction: 'asc'}],
    },
    {
      title: 'Prix croissant',
      name: 'prixAsc',
      by: [{field: 'prix', direction: 'asc'}],
    },
    {
      title: 'Prix décroissant',
      name: 'prixDesc',
      by: [{field: 'prix', direction: 'desc'}],
    },
    {
      title: 'Plus récents',
      name: 'createdAtDesc',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
  ],
})
