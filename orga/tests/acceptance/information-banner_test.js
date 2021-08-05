import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Information Banner', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('ImportStudents banner', function() {

    test('should redirect to /eleves when clicking on banner button', async function(assert) {
      // given
      const user = server.create('user', { pixOrgaTermsOfServiceAccepted: true });
      const organization = server.create('organization', { type: 'SCO', isManagingStudents: true });
      const membership = server.create('membership', {
        organizationId: organization.id,
        userId: user.id,
      });
      user.userOrgaSettings = server.create('user-orga-setting', { user, organization });
      user.memberships = [membership];
      server.create('prescriber', {
        id: user.id,
        pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
        areNewYearSchoolingRegistrationsImported: false,
        memberships: user.memberships,
        userOrgaSettings: user.userOrgaSettings,
      });
      await authenticateSession(user.id);

      // when
      await visit('/');
      await clickByLabel('importer ou ré-importer la base élèves');

      // then
      assert.equal(currentURL(), '/eleves');
    });
  });
});
