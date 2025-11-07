// studio/schemas/project.js
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      options: {
        dateFormat: 'DD/MM/YYYY',
      },
    }),
    // UPDATED: This field now supports external URLs and media type selection
    defineField({
      name: 'mediaItems', // Renamed for clarity: one list for all media types
      title: 'Project Media (Images/Videos)',
      type: 'array',
      of: [
        {
          type: 'object', // Use an object to hold the media type and URL
          title: 'Media Item',
          fields: [
            defineField({
              name: 'url',
              title: 'URL Link (Unsplash/YouTube)',
              type: 'url',
              validation: Rule => Rule.uri({
                scheme: ['http', 'https']
              })
            }),
            defineField({
              name: 'type',
              title: 'Media Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Image (Unsplash/Static Link)', value: 'image' },
                  { title: 'Video (YouTube Link)', value: 'youtube' },
                ],
                layout: 'radio',
              },
              initialValue: 'image',
            }),
            defineField({
              name: 'alt',
              title: 'Alt Text (for Images)',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt / Brief Showcase Text',
      type: 'text',
      rows: 3,
    }),
  ],
});