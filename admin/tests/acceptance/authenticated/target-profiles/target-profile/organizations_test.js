import { fillByLabel, clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Target Profiles | Target Profile | Organizations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let currentUser;
  let targetProfile;

  hooks.beforeEach(async function () {
    currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    targetProfile = this.server.create('target-profile', { name: 'Profil cible du ghetto' });
  });

  module('with multiple organizations', function (hooks) {
    hooks.beforeEach(async function () {
      this.server.create('organization', { name: 'My organization' });
      this.server.create('organization', { name: 'My other organization' });
    });

    test('should list organizations', async function (assert) {
      const screen = await visit(`/target-profiles/${targetProfile.id}/organizations`);

      assert.dom(screen.getByText('My organization')).exists();
      assert.dom(screen.getByText('My other organization')).exists();
    });
  });

  test('should be able to add new organization to the target profile', async function (assert) {
    const screen = await visit(`/target-profiles/${targetProfile.id}/organizations`);

    await fillByLabel('Rattacher une ou plusieurs organisation(s)', '42');
    await clickByName('Valider le rattachement');

    assert.dom(screen.getByLabelText('Organisation')).includesText('42');
  });

  test('should be able to attach an organization with given target profile', async function (assert) {
    const screen = await visit(`/target-profiles/${targetProfile.id}/organizations`);

    await fillByLabel("Rattacher les organisations d'un profil cible existant", '43');
    await clickByName('Valider le rattachement à partir de ce profil cible');

    assert.dom(screen.getByLabelText('Organisation')).includesText('Organization for target profile 43');
  });
});
