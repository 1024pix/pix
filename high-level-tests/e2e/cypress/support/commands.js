const jsonwebtoken = require('jsonwebtoken');

Cypress.Commands.add('login', (username, password) => {
  cy.server();
  cy.route('/api/users/me').as('getCurrentUser');
  cy.request({
    url: `${Cypress.env('API_URL')}/api/token`,
    method: 'POST',
    form: true,
    body: {
      username,
      password,
    }
  }).then((response) => {
    window.localStorage.setItem('ember_simple_auth-session', JSON.stringify({
      authenticated: {
        authenticator: 'authenticator:oauth2',
        token_type: 'bearer',
        access_token: response.body.access_token,
        user_id: response.body.user_id
      }
    }));
  });
  cy.wait(['@getCurrentUser']);
});

Cypress.Commands.add('loginAdmin', (username, password) => {
  cy.server();
  cy.route('/api/users/me').as('getCurrentUser');
  cy.request({
    url: `${Cypress.env('API_URL')}/api/token`,
    method: 'POST',
    form: true,
    body: {
      username,
      password,
    }
  }).then((response) => {
    window.localStorage.setItem('ember_simple_auth-session', JSON.stringify({
      authenticated: {
        authenticator: 'authenticator:oauth2',
        token_type: 'bearer',
        access_token: response.body.access_token,
        user_id: 2
      }
    }));
  });
  cy.wait(['@getCurrentUser']);
});

Cypress.Commands.add('loginExternalPlatform', () => {
  cy.server();
  cy.route('/api/users/me').as('getCurrentUser');
  const token = jsonwebtoken.sign(
    { user_id: 1, source: 'external' },
    Cypress.env('AUTH_SECRET'),
    { expiresIn: '1h' }
  );
  cy.visitMonPix(`/?token=${token}`);
  cy.wait(['@getCurrentUser']);
});

Cypress.Commands.add('loginWithAlmostExpiredToken', () => {
  cy.server();
  cy.route('/api/users/me').as('getCurrentUser');
  const token = jsonwebtoken.sign(
    { user_id: 1 },
    Cypress.env('AUTH_SECRET'),
    { expiresIn: '2s' }
  );
  cy.visitMonPix(`/?token=${token}`);
  cy.wait(['@getCurrentUser']);
});

Cypress.Commands.add('visitMonPix', (url) => {
  return cy.visit(url, { app: 'default' });
});

Cypress.Commands.add('visitOrga', (url) => {
  return cy.visit(url, { app: 'orga' });
});

Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  const ORGA_URL = Cypress.env('ORGA_URL');

  if (options.app === 'orga') {
    url = ORGA_URL + url;
  }

  return originalFn(url, options);
});
