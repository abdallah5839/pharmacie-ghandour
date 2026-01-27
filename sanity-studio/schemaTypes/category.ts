import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Catégorie',
  type: 'document',
  fields: [
    defineField({
      name: 'nom',
      title: 'Nom',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'icon',
      title: 'Icône',
      type: 'string',
      description: 'Nom de l\'icône Lucide (ex: sparkles, pill, baby)',
      options: {
        list: [
          {title: 'Sparkles (Étoiles)', value: 'sparkles'},
          {title: 'Droplet (Goutte)', value: 'droplet'},
          {title: 'Pill (Pilule)', value: 'pill'},
          {title: 'Leaf (Feuille)', value: 'leaf'},
          {title: 'Baby (Bébé)', value: 'baby'},
          {title: 'SparkleAlt (Hygiène)', value: 'sparkleAlt'},
          {title: 'Sun (Soleil)', value: 'sun'},
          {title: 'Scissors (Ciseaux)', value: 'scissors'},
          {title: 'Heart (Coeur)', value: 'heart'},
          {title: 'Shield (Bouclier)', value: 'shield'},
        ],
      },
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'ordre',
      title: 'Ordre d\'affichage',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Afficher cette catégorie sur le site',
    }),
    defineField({
      name: 'afficherAccueil',
      title: 'Afficher sur l\'accueil',
      type: 'boolean',
      initialValue: true,
      description: 'Afficher dans le carrousel de la page d\'accueil',
    }),
  ],
  preview: {
    select: {
      title: 'nom',
      subtitle: 'description',
      media: 'image',
    },
  },
  orderings: [
    {
      title: 'Ordre d\'affichage',
      name: 'ordreAsc',
      by: [{field: 'ordre', direction: 'asc'}],
    },
    {
      title: 'Nom A-Z',
      name: 'nomAsc',
      by: [{field: 'nom', direction: 'asc'}],
    },
  ],
})
