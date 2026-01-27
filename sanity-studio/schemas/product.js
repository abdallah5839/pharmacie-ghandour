export default {
  name: 'product',
  title: 'Produit',
  type: 'document',
  fields: [
    {
      name: 'nom',
      title: 'Nom du produit',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'nom',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'categorie',
      title: 'Catégorie',
      type: 'reference',
      to: [{type: 'category'}],
      validation: Rule => Rule.required()
    },
    {
      name: 'marque',
      title: 'Marque',
      type: 'string'
    },
    {
      name: 'reference',
      title: 'Référence',
      type: 'string'
    },
    {
      name: 'prix',
      title: 'Prix (FCFA)',
      type: 'number',
      validation: Rule => Rule.required().positive()
    },
    {
      name: 'imagePrincipale',
      title: 'Image principale',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'galerie',
      title: 'Galerie d\'images',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}]
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'composition',
      title: 'Composition',
      type: 'text'
    },
    {
      name: 'posologie',
      title: 'Posologie',
      type: 'text'
    },
    {
      name: 'indications',
      title: 'Indications',
      type: 'text'
    },
    {
      name: 'precautions',
      title: 'Précautions',
      type: 'text'
    },
    {
      name: 'prescriptionRequise',
      title: 'Ordonnance requise',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'enStock',
      title: 'En stock',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'populaire',
      title: 'Produit populaire',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'statut',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          {title: 'Brouillon', value: 'brouillon'},
          {title: 'Publié', value: 'publie'},
          {title: 'Archivé', value: 'archive'}
        ],
        layout: 'radio'
      },
      initialValue: 'brouillon'
    }
  ],
  preview: {
    select: {
      title: 'nom',
      subtitle: 'marque',
      media: 'imagePrincipale'
    }
  }
}
