import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Update', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should allow to update a campaign', async function(assert) {
    // given
    let user = createUserWithMembership();
    await authenticateSession({ user_id: user.id });
    let campaign = server.create('campaign', { id: 1 });
    let newTitle = "New title";
    let newText = "New text";

    await visit(`/campagnes/${campaign.id}/modification`);
    await fillIn('#campaign-title', newTitle);
    await fillIn('#campaign-custom-landing-page-text', newText);

    // when
    await click('button[type="submit"]');

    // then
    assert.equal(server.db.campaigns.find(1).title, newTitle);
    assert.equal(server.db.campaigns.find(1).customLandingPageText, newText);
    assert.equal(currentURL(), '/campagnes/1');
  });
});
