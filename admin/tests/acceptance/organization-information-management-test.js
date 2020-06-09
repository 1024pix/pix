import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | organization information management', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await createAuthenticateSession({ userId: 1 });
  });

  test('visiting /organizations/:id', async function(assert) {
    // given
    const organization = this.server.create('organization');

    // when
    await visit(`/organizations/${organization.id}`);

    // then
    assert.equal(currentURL(), `/organizations/${organization.id}`);
  });

  module('editing organization', function() {

    test('should edit organization\'s name, externalId and provinceCode', async function(assert) {
      // given
      const organization = this.server.create('organization');
      await visit(`/organizations/${organization.id}`);
      await click('button[aria-label="Editer"]');

      // when
      await fillIn('#name', 'newOrganizationName');
      await fillIn('#externalId', 'newOrganizationExternalId');
      await fillIn('#provinceCode', 'newOrganizationProvinceCode');
      await click('button[aria-label="Enregistrer"]');

      // then
      assert.contains('newOrganizationName');
      assert.contains('newOrganizationExternalId');
      assert.contains('newOrganizationProvinceCode');
    });
  });
});
