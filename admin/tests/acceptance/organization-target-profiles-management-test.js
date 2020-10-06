import { module, test } from 'qunit';
import { click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | organization target profiles management', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await createAuthenticateSession({ userId: 1 });
  });

  test('should display organization target profiles', async function(assert) {
    // given
    const organizationId = this.server.create('organization').id;
    this.server.create('target-profile', { name: 'Profil cible du ghetto', organizationId });

    // when
    await visit(`/organizations/${organizationId}/target-profiles`);

    // then
    assert.dom('[aria-label="Profil cible"]').includesText('Profil cible du ghetto');
  });

  test('should add a target profile to an organization', async function(assert) {
    // given
    const organization = this.server.create('organization');

    // when
    await visit(`/organizations/${organization.id}/target-profiles`);
    await fillIn('[aria-label="ID du ou des profil(s) cible(s)"]', '66');
    await click('[aria-label="Rattacher un ou plusieurs profil(s) cible(s)"] button');

    // then
    assert.dom('[aria-label="Profil cible"]').includesText('66');
    assert.dom('[aria-label="ID du ou des profil(s) cible(s)"]').hasNoValue();
  });
});
