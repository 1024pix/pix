import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    watch: false,
    pool: 'threads',
    poolOptions: { threads: { singleThread: true } },
  },
});
