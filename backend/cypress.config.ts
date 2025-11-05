import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080', // Your backend URL
    setupNodeEvents(on, config) {
    },
  },
});