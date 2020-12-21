const jsonwebtoken = require('jsonwebtoken');
const compareSnapshotCommand = require('cypress-visual-regression/dist/command');

function setEmberSimpleAuthSession(response) {
  window.localStorage.setItem('ember_simple_auth-session', JSON.stringify({
    authenticated: {
      authenticator: 'authenticator:oauth2',
      token_type: 'bearer',
      access_token: response.body.access_token,
      user_id: response.body.user_id
    }
  }));
}

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
  }).then(setEmberSimpleAuthSession);
  cy.wait(['@getCurrentUser']);
});

Cypress.Commands.add('loginOrga', (username, password) => {
  cy.server();
  cy.route('/api/prescription/prescribers/**').as('getCurrentUser');
  cy.request({
    url: `${Cypress.env('API_URL')}/api/token`,
    method: 'POST',
    form: true,
    body: {
      username,
      password,
    }
  }).then(setEmberSimpleAuthSession);
  cy.wait(['@getCurrentUser']);
});

Cypress.Commands.add('loginCertif', (username, password) => {
  cy.server();
  cy.route('/api/certification-point-of-contacts/**').as('getCurrentUser');
  cy.request({
    url: `${Cypress.env('API_URL')}/api/token`,
    method: 'POST',
    form: true,
    body: {
      username,
      password,
    }
  }).then(setEmberSimpleAuthSession);
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

Cypress.Commands.add('loginExternalPlatformForTheFirstTime', () => {
  cy.server();
  const externalUserToken = jsonwebtoken.sign({
        first_name: 'Daenerys',
        last_name: 'Targaryen',
        saml_id:  'SamlIdOfDaenerys',
        source: 'external'
      },
      Cypress.env('AUTH_SECRET'),
    { expiresIn: '1h' }
    );

  cy.visitMonPix(`/campagnes/?externalUser=${externalUserToken}`);
});

Cypress.Commands.add('loginExternalPlatformForTheSecondTime', () => {
  cy.server();
  cy.route('/api/users/me').as('getCurrentUser');
  const token = jsonwebtoken.sign({
      user_id: 1,
      source: 'external'
    },
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

Cypress.Commands.add('visitCertif', (url) => {
  return cy.visit(url, { app: 'certif' });
});

Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  const ORGA_URL = Cypress.env('ORGA_URL');
  const CERTIF_URL = Cypress.env('CERTIF_URL');

  if (options.app === 'orga') {
    url = ORGA_URL + url;
  }

  if (options.app === 'certif') {
    url = CERTIF_URL + url;
  }

  return originalFn(url, options);
});

compareSnapshotCommand();
