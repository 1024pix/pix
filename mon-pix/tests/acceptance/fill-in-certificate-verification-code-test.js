import { describe, it, context } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { click, visit, fillIn, currentURL, find } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Certificate verification', function() {
  setupApplicationTest();
  setupMirage();

  context('when certificate verification code is valid', function() {
    it('redirects to certificate details page', async function() {
      // Given
      await visit('/verification-certificat');
      await fillIn('#certificate-verification-code', 'P-123VALID');

      // When
      await click('button[type=submit]');

      // Then
      expect(currentURL()).to.equal('/partage-certificat/200');
    });
  });

  context('when certificate verification code is wrong', function() {
    it('does not redirect to certificate details page', async function() {
      // Given
      await visit('/verification-certificat');
      await fillIn('#certificate-verification-code', 'P-12345678');

      // When
      await click('button[type=submit]');

      // Then
      expect(currentURL()).to.equal('/verification-certificat');
    });

    it('shows error message', async function() {
      // Given
      await visit('/verification-certificat');
      await fillIn('#certificate-verification-code', 'P-12345678');

      // When
      await click('button[type=submit]');

      // Then
      expect(find('.form__error--not-found')).to.exist;
    });
  });

  context('when user visits /partage-certificat/200 directly', function() {
    it('redirects to /verification-certificat', async function() {
      // When
      await visit('/partage-certificat/200');

      // Then
      expect(currentURL()).to.equal('/verification-certificat');
    });
  });

});
