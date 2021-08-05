import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Details', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When prescriber is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // given
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function(hooks) {

    hooks.beforeEach(async () => {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    test('it should redirect to update page on click on return button', async function(assert) {
      // given
      server.create('campaign', { id: 1 });
      server.create('campaign-participant-activity', { firstName: 'toto' });
      await visit('/campagnes/1');

      // when
      await clickByLabel('Retour');

      // then
      assert.equal(currentURL(), '/campagnes');
    });
  });
});
