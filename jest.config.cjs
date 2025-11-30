/** @type {import('jest').Config} */
module.exports = {
  rootDir: ".",

  roots: ["<rootDir>/apps/client"],

  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/apps/client/src/setupTests.ts"],

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  testMatch: ["**/*.test.(ts|tsx|js|jsx)"],

  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest",
  },

  transformIgnorePatterns: ["node_modules/(?!(uuid)/)"],

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

  },

  clearMocks: true,
}
