import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  plugins: [react()],
  optimizeDeps: {
    include: ['exceljs'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
