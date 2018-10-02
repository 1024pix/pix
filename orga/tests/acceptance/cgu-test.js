import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession, currentSession } from 'ember-simple-auth/test-support';
import { createUserWithOrganizationAccess } from '../helpers/test-init';
import { Response } from 'ember-cli-mirage';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | cgu', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.beforeEach(() => {
    user = createUserWithOrganizationAccess();
  });

  test('it should redirect user to login page if not logged in', async function(assert) {
    // when
    await visit('/cgu');

    // then
    assert.equal(currentURL(), '/connexion');
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
  });

  test('it should send request for saving Pix-orga cgu when submitting', async function(assert) {
    // given
    let cguOrgaValue;
    server.patch('/users/:id', (schema, request) => {
      let requestBodyParams = JSON.parse(request.requestBody);
      cguOrgaValue = requestBodyParams.data.attributes['cgu-orga'];
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
    assert.equal(cguOrgaValue, true);
  });

  test('it should redirect to campaign list after saving cgu validation', async function(assert) {
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
    assert.equal(currentURL(), '/campagnes/liste');
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
    await click('#cgu-cancel-button');

    // then
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still authenticated');
  });

});
