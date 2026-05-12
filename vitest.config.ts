import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      ADMIN_TOKEN: 'test_token_for_tests'
    }
  }
})
