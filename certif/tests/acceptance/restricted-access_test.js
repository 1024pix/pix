import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from '../helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Restricted access', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When certificationPointOfContact is not logged in', function () {
    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function (assert) {
      // when
      await visit('/espace-ferme');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/connexion');
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
        await visit('/espace-ferme');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/sessions/liste');
      });
    });

    module('when current certification center is blocked', function (hooks) {
      hooks.beforeEach(() => {
        const blockedCertificationCenterAccess = server.create('allowed-certification-center-access', {
          type: 'SCO',
          isRelatedToManagingStudentsOrganization: true,
          isAccessBlockedCollege: true,
          isAccessBlockedLycee: false,
          isAccessBlockedAEFE: false,
          isAccessBlockedAgri: false,
        });
        certificationPointOfContact.update({
          allowedCertificationCenterAccesses: [blockedCertificationCenterAccess],
        });
      });

      test('it should render the espace-ferme page', async function (assert) {
        // when
        await visit('/espace-ferme');

        // then
        assert.contains('Ouverture de votre espace PixCertif');
        assert.contains('Le 1er novembre pour les lycées et le 1er février pour les collèges');
      });
    });
  });
});
