import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  authenticateSession,
  currentSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import {
  createUserWithMembership,
  createUserWithMembershipAndTermsOfServiceAccepted
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authentication', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When user is not logged in', function() {

    test('it should redirect user to login page', async function(assert) {
      // given
      await invalidateSession();

      // when
      await visit('/');

      // then
      assert.equal(currentURL(), '/connexion');
      assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
    });
  });

  module('When user is logging in but has not accepted terms of service yet', function(hooks) {

    hooks.beforeEach(async () => {
      await invalidateSession();
      user = createUserWithMembership();
    });

    test('it should redirect user to the terms-of-service page', async function(assert) {
      // given
      await visit('/connexion');
      await fillIn('#login-email', user.email);
      await fillIn('#login-password', 'secret');

      // when
      await click('button[type=submit]');

      // then
      assert.equal(currentURL(), '/cgu');
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
    });

    test('it should not show menu nor top bar', async function(assert) {
      // given
      await visit('/connexion');
      await fillIn('#login-email', user.email);
      await fillIn('#login-password', 'secret');

      // when
      await click('button[type=submit]');

      // then
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

      assert.dom('.app__sidebar').doesNotExist();
      assert.dom('.main-content__topbar').doesNotExist();
    });
  });

  module('When user is logging in and has accepted terms of service', function(hooks) {

    hooks.beforeEach(async () => {
      await invalidateSession();
      user = createUserWithMembershipAndTermsOfServiceAccepted();
    });

    test('it should redirect user to the session list', async function(assert) {
      // given
      await visit('/connexion');
      await fillIn('#login-email', user.email);
      await fillIn('#login-password', 'secret');

      // when
      await click('button[type=submit]');

      // then
      assert.equal(currentURL(), '/sessions/liste');
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
    });

    test('it should show user name', async function(assert) {
      // given
      await visit('/connexion');
      await fillIn('#login-email', user.email);
      await fillIn('#login-password', 'secret');

      // when
      await click('button[type=submit]');

      // then
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

      assert.dom('.topbar__user-identification').hasText('Harry Cover');
    });
  });

  module('When user is already authenticated and has accepted terms of service', function(hooks) {

    hooks.beforeEach(async () => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should let user access requested page', async function(assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.equal(currentURL(), '/sessions/liste');
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
    });

    test('it should show the name of certification center', async function(assert) {
      await visit('/sessions/liste');

      assert.dom('.sidebar__certification-center-name').hasText('Centre de certification du pix');
    });

    test('it should redirect user to the session list on root url', async function(assert) {
      // when
      await visit('/');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

  });

});
