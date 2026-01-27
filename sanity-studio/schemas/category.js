export default {
  name: 'category',
  title: 'Catégorie',
  type: 'document',
  fields: [
    {
      name: 'nom',
      title: 'Nom',
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
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'icon',
      title: 'Icône',
      type: 'string',
      description: 'Nom de l\'icône Lucide (ex: pill, heart, baby, etc.)'
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'ordre',
      title: 'Ordre d\'affichage',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'afficherAccueil',
      title: 'Afficher sur l\'accueil',
      type: 'boolean',
      initialValue: true
    }
  ],
  preview: {
    select: {
      title: 'nom',
      media: 'image'
    }
  }
}
