// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import { disableAnimation } from "./disable-animation";

// Alternatively you can use CommonJS syntax:
// require('./commands')

const BROWSER_LOCALE = 'fr';

beforeEach(() => {
  cy.exec('npm run db:empty');

  cy.window().then((win) => {
    win.sessionStorage.clear();
  });

  // disable CSS animations due to possible flakiness with tests
  // see https://gist.github.com/cvan/576eb41ab5d382660c14e3831c33c6ea
  // for source code inspiration
  cy.on('window:before:load', (cyWindow) => {
    Object.defineProperty(cyWindow.navigator, 'language', { value: BROWSER_LOCALE })
    Object.defineProperty(cyWindow.navigator, 'languages', { value: [BROWSER_LOCALE] })
    disableAnimation(cyWindow);
  });

  cy.on('uncaught:exception', (err) => {
    if (
      err.message.includes(
        'You attempted to remove a function listener which did not exist on the instance, which means you may have attempted to remove it before it was added.'
      )
    ) {
      return false;
    }
  });
});
