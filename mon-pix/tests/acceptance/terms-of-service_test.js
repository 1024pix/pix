import { describe, it } from 'mocha';
import { click, currentURL } from '@ember/test-helpers';
import { authenticateByEmail } from '../helpers/authentication';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

describe('Acceptance | terms-of-service', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  describe('When user log in and must validate Pix latest terms of service', async function () {
    it('should be redirected to terms-of-services page', async function () {
      // given
      const user = server.create('user', {
        email: 'with-email',
        password: 'pix123',
        cgu: true,
        mustValidateTermsOfService: true,
        lastTermsOfServiceValidatedAt: new Date(),
      });

      // when
      await authenticateByEmail(user);

      // then
      expect(currentURL()).to.equal('/cgu');
    });
  });

  describe('when the user has validated terms of service', async function () {
    it('should redirect to default page when user validate the terms of service', async function () {
      // given
      const user = server.create('user', {
        email: 'with-email',
        password: 'pix123',
        cgu: true,
        mustValidateTermsOfService: true,
        lastTermsOfServiceValidatedAt: new Date(),
      });
      await authenticateByEmail(user);

      // when
      await click('#pix-cgu');
      await clickByLabel(this.intl.t('pages.terms-of-service-pole-emploi.form.button'));

      // then
      expect(currentURL()).to.equal('/accueil');
    });
  });
});
