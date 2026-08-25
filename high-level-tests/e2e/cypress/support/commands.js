const { addCompareSnapshotCommand } = require('cypress-visual-regression/dist/command');
require('@testing-library/cypress/add-commands');

function getLoginBody(username, password) {
  return {
    username,
    password,
    grant_type: 'password',
  };
}

function setEmberSimpleAuthSession(response) {
  window.localStorage.setItem(
    'ember_simple_auth-session',
    JSON.stringify({
      authenticated: {
        authenticator: 'authenticator:oauth2',
        token_type: 'bearer',
        access_token: response.body.access_token,
        user_id: response.body.user_id,
        refresh_token: response.body.refresh_token,
        expires_in: 1000,
      },
    })
  );
}

Cypress.Commands.add("login", (username, password, url) => {
  cy.intercept("/api/users/me").as("getCurrentUser");
  cy.request({
    url: `${Cypress.env('APP_URL')}/api/token`,
    method: 'POST',
    form: true,
    body: getLoginBody(username, password),
  }).then(setEmberSimpleAuthSession);
  if (url) cy.visitMonPix(url);

  cy.wait(["@getCurrentUser"]);
});

Cypress.Commands.add('loginOrga', (username, password) => {
  cy.intercept('/api/prescription/prescribers/**').as('getCurrentUser');
  cy.request({
    url: `${Cypress.env('ORGA_URL')}/api/token`,
    method: 'POST',
    form: true,
    body: getLoginBody(username, password),
  }).then(setEmberSimpleAuthSession);
  cy.wait(["@getCurrentUser"]);
});

function signToken(payload, options) {
  return cy.task('jwt:sign', { payload, options });
}

Cypress.Commands.add('loginExternalPlatformForTheFirstTime', () => {
  signToken(
    {
      first_name: 'Daenerys',
      last_name: 'Targaryen',
      saml_id: 'SamlIdOfDaenerys',
      source: 'external',
    },
    { expiresIn: '1h' }
  ).then((externalUserToken) => {
    cy.visitMonPix(`/campagnes/?externalUser=${externalUserToken}`);
  });
});

Cypress.Commands.add('loginExternalPlatformForTheSecondTime', () => {
  cy.intercept('/api/users/me').as('getCurrentUser');
  signToken(
    {
      user_id: 1,
      source: 'external',
      aud: Cypress.env('APP_URL'),
    },
    { expiresIn: '1h' }
  ).then((token) => {
    cy.visitMonPix(`/connexion/gar#${token}`);
  });
  cy.wait(['@getCurrentUser']);
});

Cypress.Commands.add('loginWithAlmostExpiredToken', () => {
  cy.intercept('/api/users/me').as('getCurrentUser');
  signToken({
    user_id: 1,
    aud: Cypress.env('APP_URL'),
  }, {
    expiresIn: '4s',
  }).then((token) => {
    cy.visitMonPix(`/connexion/gar#${token}`);
  });
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
  const APP_URL = Cypress.env('APP_URL');

  if (options.app === 'orga') {
    url = ORGA_URL + url;
  } else {
    url = APP_URL + url;
  }

  return originalFn(url, options);
});

Cypress.Commands.add('checkA11yAndShowViolations', ({ context = {}, options = {}, url, skipFailures = false }) => {
  const logViolations = (violations) => {
    cy.task(
      'log',
      `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} ${violations.length === 1 ? 'was' : 'were'} detected on ${url}`
    )

    const violationData = violations.map(
      ({ id, impact, description, nodes, help, helpUrl }) => ({
        id,
        impact,
        description,
        help,
        helpUrl,
        nodes: nodes.map(({ target }) => target).join(','),
      })
    )
    cy.task('log', violationData)
  }

  return cy.checkA11y(context, options, logViolations, skipFailures);
})

addCompareSnapshotCommand();
