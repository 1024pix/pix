import { module, test } from 'qunit';
import { visit, currentURL, find, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession, currentSession } from 'ember-simple-auth/test-support';
import { createUserWithOrganizationAccess } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authentication', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should redirect user to login page if not logged in', async function(assert) {
    // when
    await visit('/');

    // then
    assert.equal(currentURL(), '/connexion');
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
  });

  test('it should show user name once user is logged in', async function(assert) {
    // given
    const user = createUserWithOrganizationAccess();
    server.create('campaign');

    await visit('/connexion');
    await fillIn('#login-email', user.email);
    await fillIn('#login-password', 'secret');

    // when
    await click('button[type=submit]');

    // then
    assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

    assert.equal(find('.topbar__user-identification').innerText.trim(), "Harry Cover");
  });

  test('it should redirect user to the campaigns list once logged in', async function(assert) {
    // given
    const user = createUserWithOrganizationAccess();
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

  test('it should let user access requested page if user is already authenticated', async function(assert) {
    // given
    const user = createUserWithOrganizationAccess();

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
    const user = createUserWithOrganizationAccess();

    await authenticateSession({
      user_id: user.id,
      access_token: 'access token',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });

    // when
    await visit('/');

    // then
    assert.equal(find('.current-organization-panel__name').innerText.trim(), "BRO & Evil Associates");
  });

  test('it should redirect user to the campaigns list on root url', async function(assert) {
    // given
    const user = createUserWithOrganizationAccess();

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

});
