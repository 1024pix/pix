import { click, fillIn, find, currentURL } from '@ember/test-helpers';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Reset Password', function() {
  setupApplicationTest();
  setupMirage();

  it('can visit /mot-passe-oublie', async function() {
    // when
    await visitWithAbortedTransition('/mot-de-passe-oublie');

    // then
    expect(currentURL()).to.equal('/mot-de-passe-oublie');
  });

  it('display a form to reset the email', async function() {
    // when
    await visitWithAbortedTransition('/mot-de-passe-oublie');

    // then
    expect(find('.sign-form__container')).to.exist;
  });

  it('should stay on mot de passe oublié page, and show success message, when email sent correspond to an existing user', async function() {
    // given
    this.server.create('user', {
      id: 1,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!'
    });
    await visitWithAbortedTransition('/mot-de-passe-oublie');
    await fillIn('#email', 'brandone.martins@pix.com');

    // when
    await click('.button');

    expect(currentURL()).to.equal('/mot-de-passe-oublie');
    expect(find('.password-reset-demand-form__body')).to.exist;
  });

  it('should stay in mot-passe-oublie page when sent email do not correspond to any existing user', async function() {
    // given
    this.server.create('user', {
      id: 1,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!'
    });
    await visitWithAbortedTransition('/mot-de-passe-oublie');
    await fillIn('#email', 'unexisting@user.com');

    // when
    await click('.button');

    expect(currentURL()).to.equal('/mot-de-passe-oublie');
    expect(find('.sign-form__notification-message--error')).to.exist;
  });

});
