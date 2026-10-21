import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Serves api/admin.js during `npm run dev` (on Vercel it runs as a serverless function),
// so the admin page works the same locally. Secrets come from .env.local, server side only.
function adminApiDev() {
  return {
    name: 'admin-api-dev',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v
      server.middlewares.use('/api/admin', async (req, res) => {
        try {
          const chunks = []
          for await (const c of req) chunks.push(c)
          const raw = Buffer.concat(chunks)
          const type = req.headers['content-type'] || ''
          req.url = `/api/admin${req.url === '/' ? '' : req.url}`
          req.body = type.includes('json') ? JSON.parse(raw.toString() || '{}') : raw
          res.status = (code) => { res.statusCode = code; return res }
          res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) }
          const mod = await server.ssrLoadModule('/api/admin.js')
          await mod.default(req, res)
        } catch (err) {
          console.error('[admin api]', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Admin API error' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), adminApiDev()],
})
