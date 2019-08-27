import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  authenticateSession,
  currentSession
} from 'ember-simple-auth/test-support';
import {
  createUserWithMembership,
  createUserWithMembershipAndTermsOfServiceAccepted
} from '../helpers/test-init';
import { Response } from 'ember-cli-mirage';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | terms-of-service', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  test('it should redirect user to login page if not logged in', async function(assert) {
    // when
    await visit('/cgu');

    // then
    assert.equal(currentURL(), '/connexion');
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
  });

  module('When user has not accepted terms of service yet', function(hooks) {

    hooks.beforeEach(async () => {
      user = createUserWithMembership();

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should send request for saving Pix-certif terms of service acceptation when submitting', async function(assert) {
      // given
      let pixCertifTermsOfServiceAccepted = null;
      server.patch('/users/:id', (schema, request) => {
        const requestBodyParams = JSON.parse(request.requestBody);
        pixCertifTermsOfServiceAccepted = requestBodyParams.data.attributes['pix-certif-terms-of-service-accepted'];
        return new Response(204);
      });

      await visit('/cgu');

      // when
      await click('button[type=submit]');

      // then
      assert.equal(pixCertifTermsOfServiceAccepted, true);
    });

    test('it should redirect to session list after saving terms of service acceptation', async function(assert) {
      // given
      server.patch('/users/:id', new Response(204));

      await visit('/cgu');

      // when
      await click('button[type=submit]');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    test('it should logout when user clicks on cancel button', async function(assert) {
      // given
      await visit('/cgu');

      // when
      await click('#terms-of-service-cancel-button');

      // then
      assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still authenticated');
    });
  });

  module('When user has already accepted terms of service', function(hooks) {

    hooks.beforeEach(async () => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should redirect to session list', async function(assert) {
      // when
      await visit('/cgu');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });
  });
});
