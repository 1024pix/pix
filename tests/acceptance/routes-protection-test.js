import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | routes protection', function(hooks) {
  setupApplicationTest(hooks);

  test('guest users can visit /about', async function(assert) {
    // when
    await visit('/about');

    // then
    assert.equal(currentURL(), '/about');
  });

  //
  // route /organizations
  //

  test('guest users are redirected to login page when visiting /organizations', async function(assert) {
    // when
    await visit('/organizations/new');

    // then
    assert.equal(currentURL(), '/login');
  });

  test('authenticated users can visit /organizations/new', async function(assert) {
    // given
    await authenticateSession({
      userId: 1,
      otherData: 'some-data'
    });

    // when
    await visit('/organizations/new');

    // then
    assert.equal(currentURL(), '/organizations/new');
  });

});
