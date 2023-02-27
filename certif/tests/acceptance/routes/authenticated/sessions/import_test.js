import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import {
  authenticateSession,
  createAllowedCertificationCenterAccess,
  createCertificationPointOfContactWithCustomCenters,
} from '../../../../helpers/test-init';

module('Acceptance | Routes | Authenticated | Sessions | import', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When a user tries to go on the multiple sessions import page', function () {
    module('when the user belongs to a SCO isManagingStudent center', function () {
      module('with feature toggle authorization', function () {
        test('it should redirect the user to the sessions list page', async function (assert) {
          // given
          const certificationCenter = createAllowedCertificationCenterAccess({
            certificationCenterName: 'Centre SCO isManagingStudent',
            certificationCenterType: 'SCO',
            isRelatedOrganizationManagingStudents: true,
          });
          const certificationPointOfContact = createCertificationPointOfContactWithCustomCenters({
            pixCertifTermsOfServiceAccepted: true,
            allowedCertificationCenterAccesses: [certificationCenter],
          });
          await authenticateSession(certificationPointOfContact.id);

          server.create('session-summary', { certificationCenterId: certificationCenter.id });
          server.create('feature-toggle', { id: 0, isMassiveSessionManagementEnabled: true });

          // when
          const screen = await visit(`/sessions/import`);

          // then
          assert.strictEqual(currentURL(), '/sessions/liste');
          assert.dom(screen.getByText('Sessions de certification')).exists();
        });
      });
    });

    module('when the user belongs to a center that is not SCO isManagingStudent', function () {
      module('without feature toggle authorization', function () {
        test('it should redirect the user to the sessions list page', async function (assert) {
          // given
          const certificationCenter = createAllowedCertificationCenterAccess({
            certificationCenterName: 'Centre SUP',
            certificationCenterType: 'SUP',
            isRelatedOrganizationManagingStudents: false,
          });
          const certificationPointOfContact = createCertificationPointOfContactWithCustomCenters({
            pixCertifTermsOfServiceAccepted: true,
            allowedCertificationCenterAccesses: [certificationCenter],
          });
          await authenticateSession(certificationPointOfContact.id);
          server.create('session-summary', { certificationCenterId: certificationCenter.id });
          server.create('feature-toggle', { id: 0, isMassiveSessionManagementEnabled: false });

          // when
          const screen = await visit(`/sessions/import`);

          // then
          assert.strictEqual(currentURL(), '/sessions/liste');
          assert.dom(screen.getByText('Sessions de certification')).exists();
        });
      });

      module('with feature toggle authorization', function () {
        test('it should transition to sessions import page', async function (assert) {
          // given
          const certificationCenter = createAllowedCertificationCenterAccess({
            certificationCenterName: 'Centre SUP',
            certificationCenterType: 'SUP',
            isRelatedOrganizationManagingStudents: false,
          });
          const certificationPointOfContact = createCertificationPointOfContactWithCustomCenters({
            pixCertifTermsOfServiceAccepted: true,
            allowedCertificationCenterAccesses: [certificationCenter],
          });
          await authenticateSession(certificationPointOfContact.id);
          server.create('session-summary', { certificationCenterId: certificationCenter.id });
          server.create('feature-toggle', { id: 0, isMassiveSessionManagementEnabled: true });

          // when
          const screen = await visit(`/sessions/import`);

          // then
          assert.strictEqual(currentURL(), '/sessions/import');
          assert.dom(screen.getByText('Créer/éditer plusieurs sessions')).exists();
        });
      });
    });
  });
});
