import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | Certification Centers | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/certification-centers/list');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('it should be accessible for an authenticated user', async function (assert) {
      // when
      await visit('/certification-centers/list');

      // then
      assert.strictEqual(currentURL(), '/certification-centers/list');
    });

    test('it should set certification-centers menubar item active', async function (assert) {
      // when
      const screen = await visit('/certification-centers/list');

      // then
      assert.dom(screen.getByRole('link', { name: 'Centres de certification' })).hasClass('active');
    });

    test('it should list the certification-centers', async function (assert) {
      // given
      const certificationCenter = server.createList('certification-center', 3);
      // when
      const screen = await visit('/certification-centers/list');

      // then
      assert.dom(screen.getByLabelText(`Centre de certification ${certificationCenter[0].name}`)).exists();
      assert.dom(screen.getByLabelText(`Centre de certification ${certificationCenter[1].name}`)).exists();
      assert.dom(screen.getByLabelText(`Centre de certification ${certificationCenter[2].name}`)).exists();
    });

    test('it should display the current filter when certification-centers are filtered', async function (assert) {
      // given
      server.createList('certification-center', 1, { type: 'PRO' });
      server.createList('certification-center', 2, { type: 'SCO' });
      server.createList('certification-center', 3, { type: 'SUP' });

      // when
      const screen = await visit('/certification-centers/list?type=sup');

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Type' })).hasValue('sup');
    });

    test('should go to certification center page when line is clicked', async function (assert) {
      // given
      server.createList('certification-center', 1);
      const screen = await visit('/certification-centers/list');

      // when
      await click(screen.getByRole('link', { name: '1' }));

      // then
      assert.strictEqual(currentURL(), '/certification-centers/1');
    });
  });
});
