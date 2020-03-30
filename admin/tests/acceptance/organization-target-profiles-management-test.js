import { module, test } from 'qunit';
import { click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | organization target profiles management', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await authenticateSession({ userId: 1 });
  });

  test('should display organization target profiles', async function(assert) {
    // given
    const organization = this.server.create('organization');
    this.server.create('target-profile', { name: 'Profil cible du ghetto', organization });

    // when
    await visit(`/organizations/${organization.id}`);

    // then
    assert.dom('[aria-label="Profil cible"]').includesText('Profil cible du ghetto');
  });

  test('should add a target profile to an organization', async function(assert) {
    // given
    const organization = this.server.create('organization');

    // when
    await visit(`/organizations/${organization.id}`);
    await fillIn('[aria-label="ID du ou des profil(s) cible(s)"]', '66');
    await click('[aria-label="Rattacher un ou plusieurs profil(s) cible(s)"] button');

    // then
    assert.dom('[aria-label="Profil cible"]').includesText('66');
    assert.dom('[aria-label="ID du ou des profil(s) cible(s)"]').hasNoValue();
  });
});
