import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: 'lcov'
    },
    watch: false
  },
});
