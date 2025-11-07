// schemas/blogPost.js
export default {
    name: 'blogPost',
    title: 'Blog Post',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
      },
      {
        name: 'date',
        title: 'Date',
        type: 'date',
        options: {
          dateFormat: 'MMMM DD, YYYY',
        },
      },
      {
        name: 'author',
        title: 'Author',
        type: 'string',
      },
      {
        name: 'excerpt',
        title: 'Excerpt (Short Summary)',
        type: 'text',
        rows: 2,
      },
      {
        // Portable Text is Sanity’s rich text editor
        name: 'content',
        title: 'Content',
        type: 'array',
        of: [{ type: 'block' }],
      },
    ],
  };