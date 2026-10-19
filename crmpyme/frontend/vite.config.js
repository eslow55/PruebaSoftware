import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['src/api/**/*.{js,jsx}', 'src/context/**/*.{js,jsx}', 'src/features/**/*.{js,jsx}'],
    },
  },
  exclude: ['**/*.test.{js,jsx}'],
})