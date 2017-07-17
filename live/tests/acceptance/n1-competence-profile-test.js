import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | n1 - competence profile', function() {
  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  function seedDatabase() {
    server.loadFixtures('areas');
    server.loadFixtures('competences');
    server.create('user', {
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

  function authenticateUser() {
    visit('/connexion');
    fillIn('#pix-email', 'samurai.jack@aku.world');
    fillIn('#pix-password', 'B@ck2past');
    click('.signin-form__submit_button');
  }

  it('can visit /compte', async function() {
    // given
    seedDatabase();
    authenticateUser();

    // when
    await visit('/compte');

    // then
    return andThen(() => {
      expect(currentURL()).to.equal('/compte');
    });
  });

  it('should display user competences (with level) grouped by area', function() {
    // given
    seedDatabase();
    authenticateUser();

    // when
    visit('/compte');

    // then
    return andThen(() => {
      expect(find('.competence-by-area-item').length).to.equal(5);
      expect(find('.competence').length).to.equal(16);
    });
  });
});
