export function injectUserAccount() {
  server.loadFixtures('areas');
  server.loadFixtures('competences');

  return server.create('user', {
    id: 1,
    firstName: 'Samurai',
    lastName: 'Jack',
    email: 'samurai.jack@aku.world',
    password: 'B@ck2past',
    cgu: true,
    recaptchaToken: 'recaptcha-token-xxxxxx',
    competenceIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  });
}

export function injectOrganization(code) {
  return server.create('organization', { code });
}
