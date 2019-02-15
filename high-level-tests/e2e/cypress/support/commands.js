// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })


Cypress.Commands.add("login", (email, password) => {
  cy.server();
  cy.route('/api/users/me').as('getCurrentUser');
  cy.request({
    url: `${Cypress.env('API_URL')}/api/authentications`,
    method: 'POST',
    body: {
      data: {
        attributes: {
          email,
          password,
        }
      }
    }
  }).then((response) => {
    window.localStorage.setItem('ember_simple_auth-session', JSON.stringify({
      authenticated: {
        authenticator: "authenticator:simple",
        token: response.body.data.attributes.token,
        userId: "1"
      }
    }))
  });
  cy.wait(['@getCurrentUser']);
});
