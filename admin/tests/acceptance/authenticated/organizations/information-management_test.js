import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
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
});
