import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Details Participants', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.beforeEach(async () => {
    user = createUserWithMembershipAndTermsOfServiceAccepted();
    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
    server.create('campaign', { id: 1 });
    server.createList('campaign-participation', 2, { campaignId: 1 });
  });

  module('When user arrives on participants page', function() {

    test('it could click on user to go to details', async function(assert) {
      // when
      await visit('/campagnes/1/participants');
      await click('.tr--clickable:first-child');

      // then
      assert.equal(currentURL(), '/campagnes/1/participants/1/resultats');
    });
    test('it could return on list of participants', async function(assert) {
      // when
      await visit('/campagnes/1/participants/1');
      await click('.campaign-details-content__return-button');

      // then
      assert.equal(currentURL(), '/campagnes/1/participants');
    });

  });

});
