import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | Target Profile Organizations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('Access restriction stuff', function () {
    module('When admin member is not logged in', function () {
      test('it should not be accessible by an unauthenticated user', async function (assert) {
        // when
        await visit('/target-profiles/1/organizations');

        // then
        assert.strictEqual(currentURL(), '/login');
      });
    });

    module('When admin member is logged in', function () {
      module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function (hooks) {
        hooks.beforeEach(async function () {
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          server.create('organization', { id: 456, name: 'My organization' });
          server.create('target-profile', { id: 1, ownerOrganizationId: 456, name: 'Mon super profil cible' });
        });

        test('it should be accessible for an authenticated user', async function (assert) {
          // when
          await visit('/target-profiles/1/organizations');

          // then
          assert.strictEqual(currentURL(), '/target-profiles/1/organizations');
        });

        test('it should set target-profiles menubar item active', async function (assert) {
          // when
          const screen = await visit(`/target-profiles/1/organizations`);

          // then
          assert.dom(screen.getByRole('link', { name: 'Profils cibles' })).hasClass('active');
        });
      });

      module('when admin member has role "CERTIF"', function () {
        test('it should be redirected to Organizations page', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isCertif: true })(server);
          server.create('organization', { id: 456, name: 'My organization' });
          server.create('target-profile', { id: 2, ownerOrganizationId: 456 });

          // when
          await visit('/target-profiles/2/organizations');

          // then
          assert.strictEqual(currentURL(), '/organizations/list');
        });
      });
    });
  });

  module('Target profile organizations', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      server.create('target-profile', { id: 1, name: 'Profil cible du ghetto' });
    });

    module('with multiple organizations', function (hooks) {
      hooks.beforeEach(async function () {
        server.create('organization', { id: 456, name: 'My organization' });
        server.create('organization', { id: 789, name: 'My other organization' });
      });

      test('should list organizations', async function (assert) {
        const screen = await visit('/target-profiles/1');
        await clickByName('Organisations du profil cible');

        assert.dom(screen.getByText('My organization')).exists();
        assert.dom(screen.getByText('My other organization')).exists();
      });

      test('it should redirect to organization details on click', async function (assert) {
        // given
        await visit('/target-profiles/1');
        await clickByName('Organisations du profil cible');

        // when
        await clickByName('456');

        // then
        assert.deepEqual(currentURL(), '/organizations/456/team');
      });

      test('should be able to add new organization to the target profile', async function (assert) {
        const screen = await visit('/target-profiles/1');
        await clickByName('Organisations du profil cible');

        await fillByLabel('Rattacher une ou plusieurs organisation(s)', '42');
        await clickByName('Valider le rattachement');

        assert.dom(await screen.findByLabelText('Organisation Organization 42')).includesText('42');
      });

      test('should be able to attach an organization with given target profile', async function (assert) {
        const screen = await visit('/target-profiles/1');
        await clickByName('Organisations du profil cible');

        await fillByLabel("Rattacher les organisations d'un profil cible existant", '43');
        await clickByName('Valider le rattachement à partir de ce profil cible');

        assert.dom(await screen.findByLabelText('Organisation Organization for target profile 43')).exists();
      });
    });
  });
});
