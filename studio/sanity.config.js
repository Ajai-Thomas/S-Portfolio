import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import project from './schemaTypes/project'
import blogPost from './schemaTypes/blogPost'

export default defineConfig({
  name: 'default',
  title: 'Studio',

  projectId: '84ksnydx',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: [project, blogPost],
  },
})
