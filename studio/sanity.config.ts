import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

// Import your custom schema definitions (Project and Blog Post)
import project from './schemas/project'
import blogPost from './schemas/blogPost'

export default defineConfig({
  name: 'default',
  title: 'Studio',

  // Your project details are correct
  projectId: '84ksnydx',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    // List all your document types here
    types: [project, blogPost], 
  },
})