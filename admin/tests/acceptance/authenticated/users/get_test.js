import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | authenticated/users/get', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should access on user details page by URL /users/:id', async function (assert) {
    // given
    const currentUser = await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

    // when
    await visit(`/users/${currentUser.id}`);

    // then
    assert.strictEqual(currentURL(), `/users/${currentUser.id}`);
  });

  test('should access on user details page by user search form', async function (assert) {
    // given
    const currentUser = await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    const usersListAfterFilteredSearch = {
      data: [
        {
          type: 'users',
          id: '1',
          attributes: {
            'first-name': 'Pix',
            'last-name': 'Aile',
            email: 'userpix1@example.net',
          },
        },
      ],
    };

    this.server.get('/users', () => usersListAfterFilteredSearch);

    // when
    const screen = await visit('/users/list?email=userpix1example.net');
    await click(screen.getByRole('link', { name: '1' }));

    // then
    assert.strictEqual(currentURL(), `/users/${currentUser.id}`);
  });

  test('should redirect to list users page when click page title', async function (assert) {
    // given
    const currentUser = await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    await visit(`/users/${currentUser.id}`);

    // when
    await click('#link-to-users-page');

    // then
    assert.strictEqual(currentURL(), '/users/list');
  });
});
