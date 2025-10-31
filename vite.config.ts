import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // path 설정 추가
  resolve: {
    alias: [{
      find: "@src",
      replacement: path.resolve(__dirname, "src")
    },
    {
      find: "@components",
      replacement: path.resolve(__dirname, "src/components")
    }
  ]
  }
})
