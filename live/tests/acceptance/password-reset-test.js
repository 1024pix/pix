import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';

describe('Acceptance | Reset Password', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('can visit /mot-passe-oublie', async function() {
    // when
    await visit('/mot-de-passe-oublie');

    // then
    expect(currentURL()).to.equal('/mot-de-passe-oublie');
  });

  it('display a form to reset the email', async function() {
    // when
    await visit('/mot-de-passe-oublie');

    // then
    expect(find('.password-reset-page__password-reset-form')).to.have.lengthOf(1);
  });

  it('display a link to inscription page', async function() {
    // when
    await visit('/mot-de-passe-oublie');

    // then
    expect(find('.password-reset-page__inscription-button')).to.have.lengthOf(1);
  });

  it('should redirect to connexion page when email sent correspond to an existing user', async function() {
    // given
    server.create('user', {
      id: 1,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!'
    });
    await visit('/mot-de-passe-oublie');
    fillIn('.password-reset-form__form-email-input', 'brandone.martins@pix.com');

    // when
    await click('.password-reset-form__submit-button');

    // then
    return andThen(() => {
      expect(currentURL()).to.equal('/mot-de-passe-oublie');
      expect(find('.password-reset-form__form-success-message')).to.have.lengthOf(1);
    });

  });

  it('should stay in mot-passe-oublie page when sent email do not correspond to any existing user', async function() {
    // given
    server.create('user', {
      id: 1,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!'
    });
    await visit('/mot-de-passe-oublie');
    fillIn('.password-reset-form__form-email-input', 'unexisting@user.com');

    // when
    await click('.password-reset-form__submit-button');

    // then
    return andThen(() => {
      expect(currentURL()).to.equal('/mot-de-passe-oublie');
      expect(find('.password-reset-form__form-error-message')).to.have.lengthOf(1);
    });

  });

});
