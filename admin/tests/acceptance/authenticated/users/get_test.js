import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | authenticated/users/get', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let currentUser;

  hooks.beforeEach(async function () {
    currentUser = await authenticateAdminMemberWithRole({ role: 'SUPER_ADMIN' })(server);
  });

  test('User detail page can be accessed by URL /users/:id', async function (assert) {
    await visit(`/users/${currentUser.id}`);
    assert.strictEqual(currentURL(), `/users/${currentUser.id}`);
  });

  test('User detail page can be accessed from user list page', async function (assert) {
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
    await visit('/users/list?email=userpix1example.net');
    await click('tbody > tr:nth-child(1) > td:nth-child(1) > a');
    assert.strictEqual(currentURL(), `/users/${currentUser.id}`);
  });

  test('Should redirect to list users page when click page title', async function (assert) {
    await visit(`/users/${currentUser.id}`);
    assert.strictEqual(currentURL(), `/users/${currentUser.id}`);
    await click('#link-to-users-page');
    assert.strictEqual(currentURL(), '/users/list');
  });
});
