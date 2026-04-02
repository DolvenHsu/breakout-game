import { defineConfig } from 'vite'

export default defineConfig({
  base: '/breakout-game/',
  server: {
    host: true,
    allowedHosts: [
      'jomtx-123-51-165-231.run.pinggy-free.link'
    ]
  }
})
