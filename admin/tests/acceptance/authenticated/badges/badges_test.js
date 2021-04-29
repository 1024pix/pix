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

    const tube = this.server.create('tube', { practicalTitle: 'Practical title of tube' });
    const skill = this.server.create('skill', { name: '@skill2', difficulty: 2, tube });
    const badgePartnerCompetence = this.server.create('badge-partner-competence', {
      id: 1,
      name: 'Internet for dummies',
      color: 'red',
      skills: [skill],
    });

    const criterionCampaignParticipation = this.server.create('badge-criterion', {
      id: 1,
      scope: 'CampaignParticipation',
      threshold: 20,
    });
    const criterionEveryPartnerCompetence = this.server.create('badge-criterion', {
      id: 2,
      scope: 'EveryPartnerCompetence',
      threshold: 40,
      partnerCompetences: [badgePartnerCompetence],
    });

    badge = this.server.create('badge', {
      id: 1,
      title: 'My badge',
      badgeCriteria: [
        criterionCampaignParticipation,
        criterionEveryPartnerCompetence,
      ],
      badgePartnerCompetences: [
        badgePartnerCompetence,
      ],
    });
  });

  test('should display the badge', async function(assert) {
    await visit(`/badges/${badge.id}`);

    const badgeElement = find('.page-section__details');
    assert.ok(badgeElement.textContent.match(badge.title));
    assert.contains('20');
    assert.contains('Internet for dummies - red');
    assert.contains('@skill2');
    assert.contains('Practical title of tube');
  });

});
