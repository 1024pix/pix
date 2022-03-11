import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';

module('Acceptance | Organizations | Information management', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { id: userId } = server.create('user');
    await createAuthenticateSession({ userId });
  });

  module('editing organization', function () {
    test('should be able to edit organization information', async function (assert) {
      // given
      const organization = this.server.create('organization', { name: 'oldOrganizationName' });
      await visit(`/organizations/${organization.id}`);
      await clickByLabel('Editer');

      // when
      await fillInByLabel('* Nom', 'newOrganizationName');
      await clickByLabel('Enregistrer', { exact: true });

      // then
      assert.contains('newOrganizationName');
    });
  });

  module('when organization is archived', function () {
    test('should redirect to organization target profiles page', async function (assert) {
      // given
      const organization = this.server.create('organization', {
        name: 'oldOrganizationName',
        archivistFullName: 'Clément Tine',
      });

      // when
      await visit(`/organizations/${organization.id}`);

      // then
      assert.strictEqual(currentURL(), `/organizations/${organization.id}/target-profiles`);
    });

    test('should not allow user to access team page', async function (assert) {
      // given
      const organization = this.server.create('organization', {
        name: 'oldOrganizationName',
        archivistFullName: 'Clément Tine',
      });

      // when
      await visit(`/organizations/${organization.id}/team`);

      // then
      assert.strictEqual(currentURL(), `/organizations/${organization.id}/target-profiles`);
    });

    test('should not allow user to access invitation page', async function (assert) {
      // given
      const organization = this.server.create('organization', {
        name: 'oldOrganizationName',
        archivistFullName: 'Clément Tine',
      });

      // when
      await visit(`/organizations/${organization.id}/invitations`);

      // then
      assert.strictEqual(currentURL(), `/organizations/${organization.id}/target-profiles`);
    });
  });
});
