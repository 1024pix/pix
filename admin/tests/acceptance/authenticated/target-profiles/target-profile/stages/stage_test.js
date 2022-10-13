import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Target profiles | Target Profile | Stages | Stage', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/target-profiles/1/stages/1');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When admin member is logged in', function () {
    module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      test('it should be accessible for an authenticated user', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        server.create('target-profile', { id: 1 });
        server.create('stage', { id: 1 });

        // when
        await visit('/target-profiles/1/stages/1');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/stages/1');
      });
    });

    module('when admin member has role "CERTIF"', function () {
      test('it should be redirect to Organizations page', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isCertif: true })(server);
        server.create('target-profile', { id: 1 });
        server.create('stage', { id: 2 });

        // when
        await visit('/target-profiles/1/stages/2');

        // then
        assert.strictEqual(currentURL(), '/organizations/list');
      });
    });
  });
});
