// studio/schemaTypes/project.js
export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
    },
    {
      name: 'date',
      title: 'Date',
      type: 'date',
      options: {
        dateFormat: 'DD/MM/YYYY',
      },
    },
    {
      // Renamed to 'mediaItems' to support both images and links
      name: 'mediaItems', 
      title: 'Gallery (Images, Videos, External Links)',
      type: 'array',
      of: [
        // 1. Standard Sanity Image Upload
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
          ],
        },
        // 2. External Link (Google Drive, Unsplash, YouTube)
        {
          type: 'object',
          name: 'externalMedia',
          title: 'External Media (URL)',
          icon: () => '🔗',
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'URL',
              description: 'Paste your Google Drive share link, Unsplash link, or YouTube URL here.'
            },
            {
              name: 'type',
              type: 'string',
              title: 'Media Type',
              options: {
                list: [
                  { title: 'Image (Drive/Unsplash)', value: 'image' },
                  { title: 'YouTube Video', value: 'youtube' }
                ],
                layout: 'radio'
              },
              initialValue: 'image'
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text'
            }
          ],
          preview: {
            select: { title: 'alt', subtitle: 'url' }
          }
        }
      ],
    },
    {
      name: 'excerpt',
      title: 'Excerpt / Brief Showcase Text',
      type: 'text',
      rows: 3,
    },
  ],
};