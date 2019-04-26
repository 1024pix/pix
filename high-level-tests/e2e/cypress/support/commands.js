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
        authenticator: 'authenticator:simple',
        token: response.body.access_token,
        userId: '1'
      }
    }));
  });
  cy.wait(['@getCurrentUser']);
});

Cypress.Commands.add('visitOrga', (url) => {
  return cy.visit(url, { app: 'orga' });
});

Cypress.Commands.add('visitMonPix', (url) => {
  return cy.visit(url, { app: 'default' });
});

Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  if (options.app === 'orga') {
    url = 'http://localhost:4201';
  }
  return originalFn(url, options);
});
