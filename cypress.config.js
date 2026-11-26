const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.saucedemo.com/',
    specPattern: 'cypress/e2e/projetoFinal/**/*.cy.js',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 90000,
    // Os sites testados são demos públicas e às vezes instáveis:
    // no modo "cypress run" cada teste que falhar é tentado mais 1 vez.
    retries: { runMode: 1, openMode: 0 },
    video: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
