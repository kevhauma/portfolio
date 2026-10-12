// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false }
});
