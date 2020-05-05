import { describe, it } from 'mocha';
import { click, currentURL } from '@ember/test-helpers';
import { authenticateByEmail } from '../helpers/authentification';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import visit from '../helpers/visit';

describe('Acceptance | terms-of-service', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    user = server.create('user', {
      email: 'with-email',
      password: 'pix123',
      mustValidateTermsOfService: true,
      lastTermsOfServiceValidatedAt: null
    });
  });

  describe('Navigation buttons when user is authenticated', async function() {

    it('should be redirect to profile page when user validate terms of service ', async function() {
      // given
      await authenticateByEmail(user);

      // when
      await visit('/cgu');
      await click('#pix-cgu');
      await click('.terms-of-service-form-actions__submit');

      // then
      expect(currentURL()).to.equal('/profil');

    });
  });

});

