import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName } from '@1024pix/ember-testing-library';
import authenticateSession from '../helpers/authenticate-session';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Information Banner', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('ImportStudents banner', function () {
    test('should redirect to /eleves when clicking on banner button', async function (assert) {
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
      await clickByName('importer ou ré-importer la base élèves');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/eleves');
    });
  });
});
