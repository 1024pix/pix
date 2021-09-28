import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import clickByLabel from 'pix-admin/tests/helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from 'pix-admin/tests/helpers/extended-ember-test-helpers/fill-in-by-label';

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
      await visit(`/target-profiles/${targetProfile.id}/organizations`);

      assert.contains('My organization');
      assert.contains('My other organization');
    });
  });

  test('should be able to add new organization to the target profile', async function (assert) {
    await visit(`/target-profiles/${targetProfile.id}/organizations`);

    await fillInByLabel('Rattacher une ou plusieurs organisation(s)', '42');
    await clickByLabel('Valider le rattachement');

    assert.dom('[aria-label="Organisation"]').includesText('42');
  });

  test('should be able to attach an organization with given target profile', async function (assert) {
    await visit(`/target-profiles/${targetProfile.id}/organizations`);

    await fillInByLabel("Rattacher les organisations d'un profil cible existant", '43');
    await clickByLabel('Valider le rattachement à partir de ce profil cible');

    assert.dom('[aria-label="Organisation"]').includesText('Organization for target profile 43');
  });
});
