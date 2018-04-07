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
  // route /users
  //

  test('guest users are redirected to login page when visiting /users', async function(assert) {
    // when
    await visit('/users');

    // then
    assert.equal(currentURL(), '/login');
  });

  test('authenticated users can visit /users', async function(assert) {
    // given
    await authenticateSession({
      userId: 1,
      otherData: 'some-data'
    });

    // when
    await visit('/users');

    // then
    assert.equal(currentURL(), '/users');
  });

  //
  // route /organizations
  //

  test('guest users are redirected to login page when visiting /organizations', async function(assert) {
    // when
    await visit('/organizations');

    // then
    assert.equal(currentURL(), '/login');
  });

  test('authenticated users can visit /organizations', async function(assert) {
    // given
    await authenticateSession({
      userId: 1,
      otherData: 'some-data'
    });

    // when
    await visit('/organizations');

    // then
    assert.equal(currentURL(), '/organizations');
  });

  //
  // route /assessments
  //

  test('guest users are redirected to login page when visiting /assessments', async function(assert) {
    // when
    await visit('/assessments');

    // then
    assert.equal(currentURL(), '/login');
  });

  test('authenticated users can visit /assessments', async function(assert) {
    // given
    await authenticateSession({
      userId: 1,
      otherData: 'some-data'
    });

    // when
    await visit('/assessments');

    // then
    assert.equal(currentURL(), '/assessments');
  });

  //
  // route /certifications
  //

  test('guest users are redirected to login page when visiting /certifications', async function(assert) {
    // when
    await visit('/certifications');

    // then
    assert.equal(currentURL(), '/login');
  });

  test('authenticated users can visit /certifications', async function(assert) {
    // given
    await authenticateSession({
      userId: 1,
      otherData: 'some-data'
    });

    // when
    await visit('/certifications');

    // then
    assert.equal(currentURL(), '/certifications');
  });

  //
  // route /operating
  //

  test('guest users are redirected to login page when visiting /operating', async function(assert) {
    // when
    await visit('/operating');

    // then
    assert.equal(currentURL(), '/login');
  });

  test('authenticated users can visit /operating', async function(assert) {
    // given
    await authenticateSession({
      userId: 1,
      otherData: 'some-data'
    });

    // when
    await visit('/operating');

    // then
    assert.equal(currentURL(), '/operating');
  });
});
