import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: [
        "app.ts",
        "config/**/*.ts",
        "controllers/**/*.ts",
        "middleware/**/*.ts",
        "models/**/*.ts",
        "routes/**/*.ts",
        "utils/**/*.ts",
      ],
    },
  },
});
