import { click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { createAuthenticateSession } from '../../../helpers/test-init';

module('Acceptance | authenticated/targets-profile/target-profile/organizations', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let currentUser;
  let targetProfile;

  hooks.beforeEach(async function() {
    currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    targetProfile = this.server.create('target-profile', { name: 'Profil cible du ghetto' });
  });

  module('with multiple organizations', function(hooks) {

    hooks.beforeEach(async function() {
      this.server.create('organization', { name: 'My organization' });
      this.server.create('organization', { name: 'My other organization' });
    });

    test('should list organizations', async function(assert) {
      await visit(`/target-profiles/${targetProfile.id}/organizations`);

      assert.contains('My organization');
      assert.contains('My other organization');
    });
  });

  test('should be able to add new organization to the target profile', async function(assert) {
    await visit(`/target-profiles/${targetProfile.id}/organizations`);

    await fillIn('[aria-label="ID de ou des organisation(s)"]', '42');
    await click('[aria-label="Rattacher une ou plusieurs organisation(s)"] button');

    assert.dom('[aria-label="Organisation"]').includesText('42');
    assert.dom('[aria-label="ID de ou des organisation(s)"]').hasNoValue();
  });
});
