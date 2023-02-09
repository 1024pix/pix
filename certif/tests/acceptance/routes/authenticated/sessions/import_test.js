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

  let certificationPointOfContact;

  module('When a user tries to go on the multiple sessions import page', function (hooks) {
    hooks.beforeEach(async function () {
      certificationPointOfContact = server.create('certification-point-of-contact', {
        firstName: 'Buffy',
        lastName: 'Summers',
      });

      const certificationCenter = createAllowedCertificationCenterAccess({
        certificationCenterName: 'Centre SUP',
        certificationCenterType: 'SUP',
      });
      certificationPointOfContact = createCertificationPointOfContactWithCustomCenters({
        pixCertifTermsOfServiceAccepted: true,
        allowedCertificationCenterAccesses: [certificationCenter],
      });
      await authenticateSession(certificationPointOfContact.id);
      server.create('session-summary', { certificationCenterId: certificationCenter.id });
    });

    module('without feature toggle authorization', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        server.create('feature-toggle', { id: 0, isMassiveSessionManagementEnabled: false });
      });

      test('it should redirect the user to the sessions list page', async function (assert) {
        // when
        screen = await visit(`/sessions/import`);

        // then
        assert.strictEqual(currentURL(), '/sessions/liste');
        assert.dom(screen.getByText('Sessions de certification')).exists();
      });
    });

    module('with feature toggle authorization', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        server.create('feature-toggle', { id: 0, isMassiveSessionManagementEnabled: true });
      });

      test('it should redirect the user to the sessions list page', async function (assert) {
        // when
        screen = await visit(`/sessions/import`);

        // then
        assert.strictEqual(currentURL(), '/sessions/import');
        assert.dom(screen.getByText('Créer/éditer plusieurs sessions')).exists();
      });
    });
  });
});
