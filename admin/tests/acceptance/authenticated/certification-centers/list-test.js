import { visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
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

    module('when filters are used', function (hooks) {
      hooks.beforeEach(async () => {
        server.create('certification-center', { name: 'center-1', type: 'PRO' });
        server.create('certification-center', { name: 'center-2', type: 'SCO' });
        server.create('certification-center', { name: 'center-3', type: 'SUP' });
      });

      test('it should display the current filter when certification centers are filtered by name', async function (assert) {
        // when
        const screen = await visit('/certification-centers/list?name=clea-center');

        // then
        assert.dom(screen.getByRole('textbox', { name: 'Nom' })).hasValue('clea-center');
      });

      test('it should display the current filter when certification centers are filtered by type', async function (assert) {
        // when
        const screen = await visit('/certification-centers/list?type=SCO');

        // then
        assert.dom(screen.getByRole('textbox', { name: 'Type' })).hasValue('SCO');
      });

      test('it should display the current filter when certification centers are filtered by externalId', async function (assert) {
        // when
        const screen = await visit('/certification-centers/list?externalId=1234567A');

        // then
        assert.dom(screen.getByRole('textbox', { name: 'ID externe' })).hasValue('1234567A');
      });

      test('it displays non archived certification centers', async function (assert) {
        // given
        const screen = await visit('/certification-centers/list');

        // when
        const archivedSegmentedControls = screen.getByRole('radiogroup', { name: 'Masquer les centres archivés' });
        await click(within(archivedSegmentedControls).getByRole('radio', { name: 'Oui' }));

        // then
        assert.strictEqual(currentURL(), '/certification-centers/list?hideArchived=true');
      });
    });

    test('should go to certification center details page when line is clicked', async function (assert) {
      // given
      server.createList('certification-center', 1);
      const screen = await visit('/certification-centers/list');

      // when
      await click(screen.getByRole('link', { name: '1' }));

      // then
      assert.strictEqual(currentURL(), '/certification-centers/1/details');
    });
  });
});
