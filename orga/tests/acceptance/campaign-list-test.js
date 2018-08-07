import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

function _createUserWithOneOrganization() {
  const user = server.create('user');

  const organization = server.create('organization', {
    name: 'Le nom de l\'organization'
  });
  const organizationAccess = server.create('organization-access', {
    organizationId: organization.id,
    userId: user.id
  });

  user.organizationAccesses = [organizationAccess];
  return user;
}

module('Acceptance | Campaign List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should not be accessible by an unauthenticated user', async function(assert) {
    // when
    await visit('/campagnes/liste');

    // then
    assert.equal(currentURL(), '/connexion');
  });

  test('it should be accessible for an authenticated user', async function(assert) {
    // given
    const user = _createUserWithOneOrganization();

    await authenticateSession({
      user_id: user.id,
    });

    // when
    await visit('/campagnes/liste');

    // then
    assert.equal(currentURL(), '/campagnes/liste');
    assert.dom('.page__title').hasText('Campagnes');
  });

  test('it should list the campaigns of the current organization', async function(assert) {
    // given
    const user = _createUserWithOneOrganization();
    server.createList('campaign', 12);

    await authenticateSession({
      user_id: user.id,
    });

    // when
    await visit('/campagnes/liste');

    // then
    assert.dom('.campaign-item').exists({ count: 12 });
  });

});
