import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | o1 - board organization', function() {
  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  function seedDatabase() {
    server.loadFixtures('organizations');
    server.create('user', {
      id: 1,
      firstName: 'Benjamin',
      lastName: 'Marteau',
      email: 'benjamin.marteau@pix.com',
      password: '1024pix!',
      organizationIds: [1]
    });
  }

  function authenticateUser() {
    visit('/connexion');
    fillIn('#pix-email', 'benjamin.marteau@pix.com');
    fillIn('#pix-password', '1024pix!');
    click('.signin-form__submit_button');
  }

  it('can visit /board', async function() {
    // given
    seedDatabase();
    authenticateUser();

    // when
    await visit('/board');

    // then
    return andThen(() => {
      expect(currentURL()).to.equal('/board');
    });
  });

  it('should display the name and the code of my organization', async function() {
    // given
    seedDatabase();
    authenticateUser();

    // when
    await visit('/board');

    // then
    expect(find('.board-page__header-organisation__name').length).to.equal(1);
    expect(find('.board-page__header-organisation__name').text().trim()).to.equal('LexCorp');
    expect(find('.board-page__header-code__text').length).to.equal(1);
    expect(find('.board-page__header-code__text').text().trim()).to.equal('ABCD66');
  });

});
