import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Details Participants', function (hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  const rowCount = 50;
  hooks.beforeEach(async () => {
    user = createUserWithMembership();
    await authenticateSession({
      user_id: user.id,
    });
    server.create('campaign', { id: 1 });
    server.createList('campaign-participation', rowCount, { campaignId: 1 });
  });

  module('When user arrives on participants page', function () {

    test('it could click on user to go to details', async function (assert) {
      // when
      await visit('/campagnes/1/participants');
      await click('.participant-list__line:first-child');

      // then
      assert.equal(currentURL(), '/campagnes/1/participant/1');
    });

  });
});
