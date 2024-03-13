import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';

module('Acceptance | Restricted access', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When certificationPointOfContact is not logged in', function () {
    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function (assert) {
      // when
      await visitScreen('/espace-ferme');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When certificationPointOfContact is logged in', function (hooks) {
    let certificationPointOfContact;

    hooks.beforeEach(async () => {
      certificationPointOfContact = server.create('certification-point-of-contact', {
        firstName: 'Buffy',
        lastName: 'Summers',
        pixCertifTermsOfServiceAccepted: true,
      });
      await authenticateSession(certificationPointOfContact.id);
    });

    module('when current certification center is not blocked', function () {
      test('should redirect to sessions/liste', async function (assert) {
        // given
        const notBlockedCertificationCenterAccess = server.create('allowed-certification-center-access', {
          type: 'SCO',
          isRelatedToManagingStudentsOrganization: true,
          isAccessBlockedCollege: false,
          isAccessBlockedLycee: false,
        });
        certificationPointOfContact.update({
          allowedCertificationCenterAccesses: [notBlockedCertificationCenterAccess],
        });

        // when
        await visitScreen('/espace-ferme');

        // then
        assert.strictEqual(currentURL(), '/sessions/liste');
      });
    });

    module('when current certification center is blocked', function () {
      test('it should render the espace-ferme page', async function (assert) {
        // given
        const blockedCertificationCenterAccess = server.create('allowed-certification-center-access', {
          type: 'SCO',
          isRelatedToManagingStudentsOrganization: true,
          isAccessBlockedCollege: true,
          isAccessBlockedLycee: false,
          isAccessBlockedAEFE: false,
          isAccessBlockedAgri: false,
          pixCertifScoBlockedAccessDateLycee: undefined,
          pixCertifScoBlockedAccessDateCollege: '2022-11-12',
        });
        certificationPointOfContact.update({
          allowedCertificationCenterAccesses: [blockedCertificationCenterAccess],
        });

        // when
        const screen = await visitScreen('/espace-ferme');

        // then
        assert.dom(screen.getByText('Ouverture de votre espace PixCertif le 12/11/2022')).exists();
      });
    });
  });
});
