import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | authenticated/users/get', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await authenticateSession();
  });

  test('User detail page can be accessed by URL /users/:id', async function(assert) {
    const user = this.server.create('user', {
      firstName: 'John',
      lastName: 'Snow',
      email: 'john.snow@winterfell.got',
      username: 'K1ng0fTh3N0rth',
    });

    await visit(`/users/${user.id}`);

    assert.equal(currentURL(), `/users/${user.id}`);
  });

  test('User detail page can be accessed from user list page', async function(assert) {
    const users = this.server.createList('user', 10);
    const firstUser = users.firstObject;

    await visit('/users');
    await click('.tr--clickable:nth-child(1)');

    assert.equal(currentURL(), `/users/${firstUser.id}`);
  });
});
