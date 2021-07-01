import { describe } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import visit from '../helpers/visit';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import setupIntl from '../helpers/setup-intl';
import { Response } from 'ember-cli-mirage';
import { contains } from '../helpers/contains';

describe('Acceptance | RecoverAccountAfterLeavingScoRoute', function() {

  setupApplicationTest();
  setupMirage();
  setupIntl();

  context('when account recovery is disabled by default', function() {

    it('should redirect to login page', async function() {
      // given / when
      await visit('/recuperer-mon-compte');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });

  context('when account recovery is enabled', function() {

    it('should access to account recovery page', async function() {
      // given
      server.create('feature-toggle', { id: 0, isScoAccountRecoveryEnabled: true });

      //when
      await visit('/recuperer-mon-compte');

      // then
      expect(currentURL()).to.equal('/recuperer-mon-compte');
    });

    context('when two students used same account', function() {

      it('should redirect to account recovery conflict page', async function() {
        // given
        server.create('feature-toggle', { id: 0, isScoAccountRecoveryEnabled: true });

        const ineIna = '0123456789A';
        const lastName = 'Lecol';
        const firstName = 'Manuela';
        const dayOfBirth = 20;
        const monthOfBirth = 5;
        const yearOfBirth = 2000;

        server.create('user', {
          id: 1,
          firstName,
          lastName,
        });

        server.create('student-information', {
          id: 2,
          ineIna,
          firstName,
          lastName,
          birthdate: '2000-5-20',
        });

        this.server.post('/schooling-registration-dependent-users/recover-account', function() {
          return new Response(409, {}, {
            errors: [{ status: '409' }],
          });
        });

        //when
        await visit('/recuperer-mon-compte');

        await fillIn('#ineIna', ineIna);
        await fillIn('#firstName', firstName);
        await fillIn('#lastName', lastName);
        await fillIn('#dayOfBirth', dayOfBirth);
        await fillIn('#monthOfBirth', monthOfBirth);
        await fillIn('#yearOfBirth', yearOfBirth);
        await click('button[type=submit]');

        // then
        expect(contains(this.intl.t('pages.recover-account-after-leaving-sco.conflict.found-you-but', { firstName }))).to.exist;
        expect(contains(this.intl.t('pages.recover-account-after-leaving-sco.student-information.title'))).to.not.exist;
      });
    });
  });

});
