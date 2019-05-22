import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Participants Details', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.beforeEach(async () => {
    user = createUserWithMembership();
    await authenticateSession({
      user_id: user.id,
    });
    const campaignCollectiveResult = server.create('campaign-collective-result', 'withCompetenceCollectiveResults');
    server.create('campaign', { id: 1, campaignCollectiveResult });

    server.create('user', { id: 1, firstName: 'Jack', lastName: 'Doe' });
    server.create('campaign-participation', { campaignId: 1, userId: 1 });
  });

  test('it should display user details', async function(assert) {
    // when
    await visit('/campagnes/1/participants/1');

    // then
    assert.dom('.page__title').hasText('Jack Doe');
  });
});
