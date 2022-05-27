import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { clickByName, visit } from '@1024pix/ember-testing-library';

module('Acceptance | authenticated/users | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when clicking on "Vider" button', function () {
    test('should empty url params', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      await visit('/users/list?firstName=emma&lastName=sardine&email=emma@example.net');
      await clickByName('Vider les champs de recherche');

      // then
      assert.strictEqual(currentURL(), '/users/list');
    });
  });
});
