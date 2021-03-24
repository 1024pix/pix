import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Details', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When prescriber is not logged in', () => {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // given
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', (hooks) => {

    hooks.beforeEach(async () => {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should redirect to update page on click on return button', async function(assert) {
      // given
      server.create('campaign', { id: 1 });
      await visit('/campagnes/1');

      // when
      await clickByLabel('Retour');

      // then
      assert.equal(currentURL(), '/campagnes');
    });
  });
});
