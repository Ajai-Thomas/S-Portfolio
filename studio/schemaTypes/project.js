// schemas/project.js
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
        type: 'date', // Use 'date' type for better content management
        options: {
          dateFormat: 'DD/MM/YYYY',
        },
      },
      {
        // This is the array for your images/videos
        name: 'images',
        title: 'Images / Videos',
        type: 'array',
        of: [
          {
            type: 'image',
            options: { hotspot: true }, // Enables image cropping/hotspot
            fields: [
              {
                name: 'alt',
                type: 'string',
                title: 'Alternative text',
              },
            ],
          },
          // You can add a file type if you want to upload videos directly
          // { type: 'file', title: 'Video File' }
        ],
      },
      {
        name: 'excerpt', // Field for the short description on the detail page
        title: 'Excerpt / Brief Showcase Text',
        type: 'text',
        rows: 3,
      },
    ],
  };