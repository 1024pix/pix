import { fillByLabel, clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';
import { currentURL } from '@ember/test-helpers';

module('Acceptance | Target Profiles | Target Profile | Organizations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // given
      server.create('target-profile', { id: 1 });

      // when
      await visit('/target-profiles/1/insights');

      // then
      assert.deepEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function () {
    module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function (hooks) {
      let targetProfile;

      hooks.beforeEach(async function () {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
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

        assert.dom(screen.getByLabelText('Organisation Organization 42')).includesText('42');
      });

      test('should be able to attach an organization with given target profile', async function (assert) {
        const screen = await visit(`/target-profiles/${targetProfile.id}/organizations`);

        await fillByLabel("Rattacher les organisations d'un profil cible existant", '43');
        await clickByName('Valider le rattachement à partir de ce profil cible');

        assert.dom(screen.getByLabelText('Organisation Organization for target profile 43')).exists();
      });
    });

    module('when admin member has role "CERTIF"', function () {
      test('it should be redirected to Organizations list page', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isCertif: true })(server);
        server.create('target-profile', { id: 1 });

        // when
        await visit('/target-profiles/1/insights');

        // then
        assert.deepEqual(currentURL(), '/organizations/list');
      });
    });
  });
});
