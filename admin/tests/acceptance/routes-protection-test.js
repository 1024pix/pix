import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import {
  createUser,
  createAuthenticateSession,
} from '../helpers/test-init';

module('Acceptance | routes protection', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
    const user = createUser();
    await createAuthenticateSession({ userId: user.id });

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
