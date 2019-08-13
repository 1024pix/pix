import { click, currentURL, fillIn, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Reset Password Form', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  it('can visit /changer-mot-de-passe', async function() {
    // when
    await visitWithAbortedTransition('/changer-mot-de-passe/temporaryKey');

    // then
    expect(currentURL()).to.equal('/changer-mot-de-passe/temporaryKey');
  });

  it('should stay on changer-mot-de-passe, and show success message, when password is successfully reset', async function() {
    // given
    server.create('user', {
      id: 1000,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!'
    });

    server.create('password-reset-demand', {
      temporaryKey: 'brandone-reset-key',
      email: 'brandone.martins@pix.com',
    });

    await visitWithAbortedTransition('/changer-mot-de-passe/brandone-reset-key');
    fillIn('#password', 'newPass12345!');

    // when
    await click('.button');

    // then
    expect(currentURL()).to.equal('/changer-mot-de-passe/brandone-reset-key');
    expect(find('.sign-form__body').textContent).to.contain('Votre mot de passe a été modifié avec succès');

  });
});
