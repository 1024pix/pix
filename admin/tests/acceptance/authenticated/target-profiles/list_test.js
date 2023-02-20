import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Target Profiles | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/target-profiles/list');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When admin member is logged in', function () {
    module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function (hooks) {
      hooks.beforeEach(async () => {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      });

      test('it should be accessible for an authenticated user', async function (assert) {
        // when
        await visit('/target-profiles/list');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/list');
      });

      test('it should list target profile summaries', async function (assert) {
        // given
        server.create('target-profile-summary', { id: 1, name: 'COUCOU', outdated: true });
        server.create('target-profile-summary', { id: 2, name: 'CAVA', outdated: false });

        // when
        const screen = await visit('/target-profiles/list');

        // then
        assert.dom(screen.getByText('COUCOU')).exists();
        assert.dom(screen.getByText('CAVA')).exists();
      });

      test('it should redirect to target profile details on click', async function (assert) {
        // given
        const area = server.create('new-area', { id: 'area1', title: 'Area 1', code: '1' });

        server.create('target-profile', {
          id: 1,
          name: 'Profil Cible',
          newAreas: [area],
          isNewFormat: true,
        });
        server.create('target-profile-summary', { id: 1, name: 'Profil Cible', outdated: true });
        const screen = await visit('/target-profiles/list');

        // when
        await clickByName('Profil Cible');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/details');
        assert.dom(screen.getByText('1 · Area 1')).exists();
      });

      test('it should redirect to target profile creation form on click "Nouveau profil cible"', async function (assert) {
        // given
        server.create('framework', { id: 'framework', name: 'Pix' });
        await visit('/target-profiles/list');

        // when
        await clickByName('Nouveau profil cible');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/new');
      });

      module('when filters are used', function (hooks) {
        hooks.beforeEach(async () => {
          server.createList('target-profile', 12);
        });

        test('it should display the current filter when target profiles are filtered by name', async function (assert) {
          // when
          const screen = await visit('/target-profiles/list?name=sav');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Filtrer les profils cible par un nom' })).hasValue('sav');
        });

        test('it should display the current filter when target profiles are filtered by id', async function (assert) {
          // when
          const screen = await visit('/target-profiles/list?id=123');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Filtrer les profils cible par un id' })).hasValue('123');
        });
      });
    });

    module('when admin member has role "CERTIF"', function () {
      test('it should be redirect to Organizations page', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isCertif: true })(server);

        // when
        await visit('/target-profiles/list');

        // then
        assert.strictEqual(currentURL(), '/organizations/list');
      });
    });
  });
});
