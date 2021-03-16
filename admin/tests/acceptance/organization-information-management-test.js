import { module, test } from 'qunit';
import { click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | organization information management', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const { id: userId } = server.create('user');
    await createAuthenticateSession({ userId });
  });

  module('editing organization', function() {

    test('should be able to edit organization information', async function(assert) {
      // given
      const organization = this.server.create('organization', { name: 'oldOrganizationName' });
      await visit(`/organizations/${organization.id}`);
      await click('button[aria-label="Editer"]');

      // when
      await fillIn('#name', 'newOrganizationName');
      await click('button[aria-label="Enregistrer"]');

      // then
      assert.contains('newOrganizationName');
    });
  });
});
