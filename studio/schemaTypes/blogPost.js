import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      options: {
        dateFormat: 'MMMM DD, YYYY',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt (Short Summary)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  orderings: [
    {
      title: 'Date, Newest',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Date, Oldest',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
    {
      title: 'Title, A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Title, Z-A',
      name: 'titleDesc',
      by: [{ field: 'title', direction: 'desc' }],
    },
    {
      title: 'Author, A-Z',
      name: 'authorAsc',
      by: [{ field: 'author', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      date: 'date',
      excerpt: 'excerpt',
    },
    prepare({ title, author, date, excerpt }) {
      const subtitle = [author, date].filter(Boolean).join(' • ');
      return {
        title: title || 'Untitled Blog Post',
        subtitle: subtitle || excerpt,
        media: undefined,
      };
    },
  },
});