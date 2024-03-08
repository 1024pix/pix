import { currentURL, visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | routes protection', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When route is /organizations/new', function () {
    test('guest users are redirected to login page when visiting /organizations/new', async function (assert) {
      // when
      await visit('/organizations/new');

      // then
      assert.strictEqual(currentURL(), '/login');
    });

    test('authenticated users can visit /organizations/new', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      await visit('/organizations/new');

      // then
      assert.strictEqual(currentURL(), '/organizations/new');
    });
  });

  module('When route is /organizations/list', function () {
    test('guest users are redirected to login page when visiting /organizations/list', async function (assert) {
      // when
      await visit('/organizations/list');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When route is /certifications/menu', function () {
    test('guest users are redirected to login page when visiting /certifications', async function (assert) {
      // when
      await visit('/certifications');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When route is /certifications/single', function () {
    test('guest users are redirected to login page when visiting /certifications/single', async function (assert) {
      // when
      await visit('/certifications/single');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When route is /sessions', function () {
    test('guest users are redirected to login page when visiting /sessions', async function (assert) {
      // when
      await visit('/sessions');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });
});
