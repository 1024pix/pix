import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';

import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Organization Participants List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When prescriber is logged in', function () {
    let user;

    module('When organization is not managing students', function (hooks) {
      hooks.beforeEach(async function () {
        user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);
        await authenticateSession(user.id);
      });

      test('it should be accessible', async function (assert) {
        // when
        await visit('/participants');

        // then
        assert.strictEqual(currentURL(), '/participants');
      });
    });
  });
});
