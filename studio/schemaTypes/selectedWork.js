// Highlighted pieces shown in the "Selected Works" section of the site.
export default {
  name: 'selectedWork',
  title: 'Selected Work',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'category', title: 'Category', type: 'string' },
    { name: 'date', title: 'Date', type: 'date', options: { dateFormat: 'DD/MM/YYYY' } },
    { name: 'description', title: 'Description', type: 'text', rows: 3 },
    { name: 'image', title: 'Image (upload)', type: 'image', options: { hotspot: true } },
    { name: 'imageUrl', title: 'Image link (Drive, Unsplash, direct URL)', type: 'url', description: 'Used when no image is uploaded.' },
    { name: 'alt', title: 'Alternative text', type: 'string' },
    { name: 'link', title: 'Link (optional)', type: 'url', description: 'Where the "View project" button goes.' },
    { name: 'order', title: 'Order', type: 'number', description: 'Lower numbers come first. The admin page sets this when you reorder.' },
  ],
  preview: { select: { title: 'title', subtitle: 'category', media: 'image' } },
};
