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

  hooks.beforeEach(() => {
    user = createUserWithMembership();
  });

  test('it should redirect user to login page if not logged in', async function(assert) {
    // when
    await visit('/cgu');

    // then
    assert.equal(currentURL(), '/connexion');
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
  });

  test('it should send request for saving Pix-orga terms of service acceptation when submitting', async function(assert) {
    // given
    let pixOrgaTermsOfServiceAccepted;
    server.patch('/users/:id', (schema, request) => {
      const requestBodyParams = JSON.parse(request.requestBody);
      pixOrgaTermsOfServiceAccepted = requestBodyParams.data.attributes['pix-orga-terms-of-service-accepted'];
      return new Response(204);
    });

    await authenticateSession({
      user_id: user.id,
      access_token: 'access token',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
    await visit('/cgu');

    // when
    await click('button[type=submit]');

    // then
    assert.equal(pixOrgaTermsOfServiceAccepted, true);
  });

  test('it should redirect to campaign list after saving terms of service acceptation', async function(assert) {
    // given
    server.patch('/users/:id', new Response(204));

    await authenticateSession({
      user_id: user.id,
      access_token: 'access token',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
    await visit('/cgu');

    // when
    await click('button[type=submit]');

    // then
    assert.equal(currentURL(), '/campagnes');
  });

  test('it should logout when user clicks on cancel button', async function(assert) {
    // given
    await authenticateSession({
      user_id: user.id,
      access_token: 'access token',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
    await visit('/cgu');

    // when
    await click('#terms-of-service-cancel-button');

    // then
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still authenticated');
  });

  test('it should redirect to campaign list if user has already accepted terms of service', async function(assert) {
    // given
    user = createUserWithMembershipAndTermsOfServiceAccepted();
    await authenticateSession({
      user_id: user.id,
      access_token: 'access token',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });

    // when
    await visit('/cgu');

    // then
    assert.equal(currentURL(), '/campagnes');
  });
});
