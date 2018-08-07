import { module, test } from 'qunit';
import { visit, currentURL, find, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession, currentSession } from 'ember-simple-auth/test-support';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authentication', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.beforeEach(() => {
    user = server.create('user', {firstName: 'Titi', lastName: 'Toto', email: 'titi@toto.com'});
  });

  test('it should redirect user to login page if not logged in', async function(assert) {
    // when
    await visit('/');

    // then
    assert.equal(currentURL(), '/connexion');
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
  });

  test('it should show user name once user is logged in', async function(assert) {
    // given
    const organization = server.create('organization', {
      name: 'Le nom de l\'organization'
    });
    const organizationAccess = server.create('organization-access', {
      organizationId: organization.id,
      userId: user.id
    });
    user.organizationAccesses = [organizationAccess];
    server.create('campaign');

    await visit('/connexion');
    await fillIn('#login-email', 'titi@toto.com');
    await fillIn('#login-password', 'secret');

    // when
    await click('button[type=submit]');

    // then
    assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

    assert.equal(find('.topbar__user-identification').innerText.trim(), "Titi Toto");
  });

  test('it should redirect user to the campaigns list once logged in', async function(assert) {
    // given
    const organization = server.create('organization', {
      name: 'Le nom de l\'organization'
    });
    const organizationAccess = server.create('organization-access', {
      organizationId: organization.id,
      userId: user.id
    });
    user.organizationAccesses = [organizationAccess];
    server.create('campaign');

    await visit('/connexion');
    await fillIn('#login-email', 'titi@toto.com');
    await fillIn('#login-password', 'secret');

    // when
    await click('button[type=submit]');

    // then
    assert.equal(currentURL(), '/campagnes/liste');
    assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
  });

  test('it should let user access requested page if user is already authenticated', async function(assert) {
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
    assert.equal(currentURL(), '/');
    assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

    assert.equal(find('.topbar__user-identification').innerText.trim(), "Titi Toto");
  });

  test('it should display the organization linked to the connected user', async function(assert) {
    // given
    const organization = server.create('organization', {
      name: 'Le nom de l\'organization'
    });
    const organizationAccess = server.create('organization-access', {
      organizationId: organization.id,
      userId: user.id
    });
    user.organizationAccesses = [organizationAccess];

    await authenticateSession({
      user_id: user.id,
      access_token: 'access token',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });

    // when
    await visit('/');

    // then
    assert.equal(find('.current-organization-panel__name').innerText.trim(), "Le nom de l'organization");
  });

});
