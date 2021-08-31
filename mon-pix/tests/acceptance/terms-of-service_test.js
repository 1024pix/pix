import { describe, it } from 'mocha';
import { click, currentURL } from '@ember/test-helpers';
import { authenticateByEmail } from '../helpers/authentication';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | terms-of-service', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    user = server.create('user', {
      email: 'with-email',
      password: 'pix123',
      mustValidateTermsOfService: true,
      lastTermsOfServiceValidatedAt: null,
    });
  });

  describe('When user log in and must validate Pix latest terms of service', function() {

    it('should be redirected to terms-of-services page', async function() {
      // when
      await authenticateByEmail(user);

      // then
      expect(currentURL()).to.equal('/cgu');
    });
  });

  describe('when the user has validated terms of service', function() {
    it('should redirect to default page when user validate the terms of service', async function() {
      // given
      await authenticateByEmail(user);

      // when
      await click('#pix-cgu');
      await click('.terms-of-service-form-actions__submit');

      // then
      expect(currentURL()).to.equal('/accueil');
    });
  });
});

