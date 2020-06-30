import { module, test } from 'qunit';
import { click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | organization information management', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await createAuthenticateSession({ userId: 1 });
  });

  module('editing organization', function() {

    test('should edit organization\'s name, externalId, provinceCode and email', async function(assert) {
      // given
      const organization = this.server.create('organization', { name: 'oldOrganizationName', externalId: 'oldOrganizationExternalId', provinceCode: 'oldProvinceCode' });
      await visit(`/organizations/${organization.id}`);
      await click('button[aria-label="Editer"]');

      // when
      await fillIn('#name', 'newOrganizationName');
      await fillIn('#externalId', 'newOrganizationExternalId');
      await fillIn('#provinceCode', 'newOrganizationProvinceCode');
      await fillIn('#email', 'sco.generic.newaccount@example.net');

      await click('button[aria-label="Enregistrer"]');

      // then
      assert.contains('newOrganizationName');
      assert.contains('newOrganizationExternalId');
      assert.contains('newOrganizationProvinceCode');
      assert.contains('sco.generic.newaccount@example.net');

    });
  });
});
