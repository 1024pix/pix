import { clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { currentURL } from '@ember/test-helpers';

module('Acceptance | Target Profiles | Target Profile', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/target-profiles/1');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When admin member is logged in', function () {
    module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        server.create('target-profile', { id: 1, name: 'Mon super profil cible' });
      });

      test('it should be accessible for an authenticated user', async function (assert) {
        // when
        await visit('/target-profiles/1');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1');
      });

      module('when user clicks on the edit button', function () {
        module('when user goes to another page then comes back to a target profile details page', function () {
          test('it should have ended edit mode', async function (assert) {
            // given
            const screen = await visit('/target-profiles/1');
            await clickByName('Éditer');
            await clickByName('Tous les profils cibles');

            // when
            await clickByName('Mon super profil cible');

            // then
            assert.dom(screen.getByText('Éditer')).exists();
          });
        });
      });
    });

    module('when admin member has role "CERTIF"', function () {
      test('it should be redirect to Organizations page', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isCertif: true })(server);
        server.create('target-profile', { id: 2 });

        // when
        await visit('/target-profiles/2');

        // then
        assert.strictEqual(currentURL(), '/organizations/list');
      });
    });
  });
});
