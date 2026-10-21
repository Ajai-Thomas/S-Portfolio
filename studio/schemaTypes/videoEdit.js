// Video edits shown in the "Video Edits" section of the site.
export default {
  name: 'videoEdit',
  title: 'Video Edit',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'videoUrl', title: 'Video link', type: 'url', description: 'YouTube or Vimeo link, or a direct link to an .mp4 file.' },
    { name: 'duration', title: 'Duration', type: 'string', description: 'e.g. 01:24' },
    { name: 'date', title: 'Date', type: 'date', options: { dateFormat: 'DD/MM/YYYY' } },
    { name: 'description', title: 'Description', type: 'text', rows: 3 },
    { name: 'thumbnail', title: 'Thumbnail (upload)', type: 'image', options: { hotspot: true }, description: 'Optional for YouTube (its own thumbnail is used).' },
    { name: 'thumbnailUrl', title: 'Thumbnail link', type: 'url' },
    { name: 'order', title: 'Order', type: 'number', description: 'Lower numbers come first. The admin page sets this when you reorder.' },
  ],
  preview: { select: { title: 'title', subtitle: 'duration', media: 'thumbnail' } },
};
