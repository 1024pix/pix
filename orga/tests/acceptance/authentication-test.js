import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession, currentSession } from 'ember-simple-auth/test-support';
import { createUserWithOrganizationAccess, createUserWithOrganizationAccessAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authentication', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module( "When user is not logged in", function() {

    test('it should redirect user to login page', async function(assert) {
      // when
      await visit('/');

      // then
      assert.equal(currentURL(), '/connexion');
      assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
    });
  });

  module( "When user is logged in but has not accepted terms of service yet", function(hooks) {

    hooks.beforeEach(() => {
      user = createUserWithOrganizationAccess();
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
     server.create('campaign');

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

  module( "When user is logged in and has accepted terms of service", function(hooks) {

    hooks.beforeEach(() => {
      user = createUserWithOrganizationAccessAndTermsOfServiceAccepted();
    });

    test('it should redirect user to the campaigns list', async function(assert) {
      // given
      server.create('campaign');

      await visit('/connexion');
      await fillIn('#login-email', user.email);
      await fillIn('#login-password', 'secret');

      // when
      await click('button[type=submit]');

      // then
      assert.equal(currentURL(), '/campagnes/liste');
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
    });

    test('it should show user name', async function(assert) {
      // given
      server.create('campaign');

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

  module( "When user is already authenticated and has accepted terms of service", function(hooks) {

    hooks.beforeEach(() => {
      user = createUserWithOrganizationAccessAndTermsOfServiceAccepted();
    });

    test('it should let user access requested page', async function(assert) {
      // given
      await authenticateSession({
        user_id: user.id,
        access_token: 'access token',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });

      // when
      await visit('/campagnes/creation');

      // then
      assert.equal(currentURL(), '/campagnes/creation');
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
    });

    test('it should display the organization linked to the connected user', async function(assert) {
      // given
      await authenticateSession({
        user_id: user.id,
        access_token: 'access token',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });

      // when
      await visit('/');

      // then
      assert.dom('.current-organization-panel__name').hasText('BRO & Evil Associates');
    });

    test('it should redirect user to the campaigns list on root url', async function(assert) {
      // given
      await authenticateSession({
        user_id: user.id,
        access_token: 'access token',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });

      // when
      await visit('/');

      // then
      assert.equal(currentURL(), '/campagnes/liste');
    });

    test('it should redirect user to the campaigns list on /index', async function(assert) {
      // given
      await authenticateSession({
        user_id: user.id,
        access_token: 'access token',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });

      // when
      await visit('/index');

      // then
      assert.equal(currentURL(), '/campagnes/liste');
    });

  });

});
