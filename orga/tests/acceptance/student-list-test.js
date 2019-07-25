import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Student List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/eleves');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When user is logged in', function() {

    test('it should be accessible', async function(assert) {
      // given
      user = createUserWithMembershipAndTermsOfServiceAccepted();
      await authenticateSession({
        user_id: user.id,
      });

      // when
      await visit('/eleves');

      // then
      assert.equal(currentURL(), '/eleves');
    });

    test('it should show title of team page', async function(assert) {
      // given
      user = createUserWithMembershipAndTermsOfServiceAccepted();
      await authenticateSession({
        user_id: user.id,
      });

      // when
      await visit('/eleves');

      // then
      assert.dom('.page-title').hasText('Élèves');
    });

    test('it should list the students', async function(assert) {
      // given
      user = createUserWithMembershipAndTermsOfServiceAccepted();
      await authenticateSession({
        user_id: user.id,
      });

      const organizations = server.schema.organizations.where({  });
      server.createList('students', 6, { organization: organizations.models[0] });

      // when
      await visit('/eleves');

      // then
      assert.dom('.table tbody tr').exists({ count: 6 });
    });
  });
});
