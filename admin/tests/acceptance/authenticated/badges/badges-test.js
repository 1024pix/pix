import { find, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { createAuthenticateSession } from '../../../helpers/test-init';

module('Acceptance | authenticated/badges/badge', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let currentUser;
  let badge;

  hooks.beforeEach(async function() {
    currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    const criterion = this.server.create('badge-criterion', {
      id: 1,
      scope: 'CampaignParticipation',
      threshold: 20,
    });
    badge = this.server.create('badge', {
      id: 1,
      title: 'My badge',
      badgeCriteria: [
        criterion,
      ],
    });
  });

  test('should display the badge', async function(assert) {
    await visit(`/badges/${badge.id}`);

    const badgeElement = find('.page-section__details');
    assert.ok(badgeElement.textContent.match(badge.title));
    assert.contains('20');
  });
});
