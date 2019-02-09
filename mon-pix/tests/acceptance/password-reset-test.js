import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

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
    expect(find('.sign-form__container')).to.have.lengthOf(1);
  });

  it('should stay on mot de passe oublié page, and show success message, when email sent correspond to an existing user', async function() {
    // given
    server.create('user', {
      id: 1,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!'
    });
    await visit('/mot-de-passe-oublie');
    fillIn('#email', 'brandone.martins@pix.com');

    // when
    await click('.button');

    // then
    return andThen(() => {
      expect(currentURL()).to.equal('/mot-de-passe-oublie');
      expect(find('.sign-form__notification-message--success')).to.have.lengthOf(1);
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
    fillIn('#email', 'unexisting@user.com');

    // when
    await click('.button');

    // then
    return andThen(() => {
      expect(currentURL()).to.equal('/mot-de-passe-oublie');
      expect(find('.sign-form__notification-message--error')).to.have.lengthOf(1);
    });

  });

});
