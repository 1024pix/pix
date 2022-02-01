import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
  createAllowedCertificationCenterAccess,
  createCertificationPointOfContactWithCustomCenters,
} from '../helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated | team', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when user go to members list', function () {
    test('it should be possible to see members list', async function (assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      server.create('member', { firstName: 'Lili', lastName: 'Dupont' });
      await authenticateSession(certificationPointOfContact.id);

      // when
      await visit('/equipe');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/equipe');
      assert.contains('Lili');
      assert.contains('Dupont');
    });

    module('when user switch to see another certification center', function () {
      test('it should be possible to the other members list', async function (assert) {
        // given
        const certificationCenterName = 'Centre de certif des Anne-atole';
        const otherCertificationCenterName = 'Centre de certif de 7 Anne-néla';
        const certificationPointOfContact = createAllowedCertificationCenterAccess({
          certificationCenterName,
          certificationCenterType: 'SCO',
          isRelatedOrganizationManagingStudents: true,
        });
        const certificationPointOfContact2 = createAllowedCertificationCenterAccess({
          certificationCenterName: otherCertificationCenterName,
          certificationCenterType: 'SCO',
          isRelatedOrganizationManagingStudents: true,
        });
        createCertificationPointOfContactWithCustomCenters({
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [certificationPointOfContact, certificationPointOfContact2],
        });
        server.create('member', { firstName: 'Lili', lastName: 'Dupont' });
        const memberOfTheFirstCertificationCenter = server.create('member', { firstName: 'Jack', lastName: 'Adit' });
        await authenticateSession(certificationPointOfContact.id);
        await visit('/equipe');

        // when
        await click('.logged-user-summary__link');
        await click(`li[title="${otherCertificationCenterName}"] div[role="button"]`);
        memberOfTheFirstCertificationCenter.destroy();
        await visit('/equipe');

        // then
        assert.notContains('Jack');
        assert.contains('Lili');
      });
    });
  });
});
