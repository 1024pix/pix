import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Update', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should allow to update a campaign and redirect to the newly updated campaign', async function(assert) {
    // given
    const user = createUserWithMembership();
    await authenticateSession({ user_id: user.id });
    const campaign = server.create('campaign', { id: 1 });
    const newTitle = 'New title';
    const newText = 'New text';

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
