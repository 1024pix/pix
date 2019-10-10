import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | invitations', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;
  let organizationId;

  test('it should redirect user to login page if not logged in', async function(assert) {
    // when
    await visit('/invitations');

    // then
    assert.equal(currentURL(), '/connexion');
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
  });

  module('When organization-invitation already exist', function(hooks) {

    hooks.beforeEach(async () => {
      user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': false });
      organizationId = server.create('organization', { name: 'BRO & Evil Associates' }).id;
    });

    test('it should accepte invitation, create a membership, and go to logged in page', async function(assert) {
      // given
      const email = user.email;
      const temporaryKey = 'temporaryKey';
      const organizationInvitationId = server.create('organizationInvitation', {
        organizationId, email, status: 'PENDING', temporaryKey
      }).id;
      const statusExpected = 'accepted';

      // when
      await visit(`/invitations/${organizationInvitationId}?temporaryKey=${temporaryKey}`);

      // then
      const organizationInvitation = server.db.organizationInvitations[0];
      const membership = server.db.memberships[0];
      assert.equal(organizationInvitation.email, email);
      assert.equal(organizationInvitation.status, statusExpected);
      assert.equal(organizationInvitation.temporaryKey, temporaryKey);

      assert.equal(membership.userId, user.id);
      assert.equal(membership.organizationId, organizationId);

      assert.equal(currentURL(), '/connexion');
    });
  });

});
