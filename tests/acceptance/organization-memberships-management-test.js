import { module, test, only } from 'qunit';
import { click, fillIn, visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | organization memberships management', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await authenticateSession({ userId: 1 });
  });

  test('visiting /organizations/:id', async function(assert) {
    // given
    const organization = this.server.create('organization');

    // when
    await visit(`/organizations/${organization.id}`);

    // then
    assert.equal(currentURL(), `/organizations/${organization.id}`);
  });

  only('adding a member', async function(assert) {
    // given
    const organization = this.server.create('organization');
    const user = this.server.create('user', { firstName: 'John', lastName: 'Doe', email: 'user@example.com'});
    
    // when
    await visit(`/organizations/${organization.id}`);
    await fillIn('input.add-membership-form__user-email-input', 'user@example.com');
    await click('button.add-membership-form__validate-button');

    // then
    assert.dom('.member-list').includesText('John');
    assert.dom('.member-list').includesText('Doe');
    assert.dom('.member-list').includesText('user@example.com');
  });
});
