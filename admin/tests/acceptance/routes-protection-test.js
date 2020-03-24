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
  // route /organizations/new
  //

  test('guest users are redirected to login page when visiting /organizations/new', async function(assert) {
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

  //
  // route /organizations/list
  //

  test('guest users are redirected to login page when visiting /organizations/list', async function(assert) {
    // when
    await visit('/organizations/list');

    // then
    assert.equal(currentURL(), '/login');
  });

  //
  // route /certifications/menu
  //
  test('guest users are redirected to login page when visiting /certifications', async function(assert) {
    // when
    await visit('/certifications');

    // then
    assert.equal(currentURL(), '/login');
  });

  //
  // route /certifications/single
  //
  test('guest users are redirected to login page when visiting /certifications/single', async function(assert) {
    // when
    await visit('/certifications/single');

    // then
    assert.equal(currentURL(), '/login');
  });

  //
  // route /sessions
  //
  test('guest users are redirected to login page when visiting /sessions', async function(assert) {
    // when
    await visit('/sessions');

    // then
    assert.equal(currentURL(), '/login');
  });
});
