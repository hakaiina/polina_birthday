import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repository = 'polina_birthday';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? `/${repository}/` : '/',
  plugins: [react()],
});