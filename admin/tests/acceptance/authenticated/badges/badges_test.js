import { find } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { createAuthenticateSession } from '../../../helpers/test-init';

module('Acceptance | authenticated/badges/badge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should display the badge', async function (assert) {
    // given
    const currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    const tube = this.server.create('tube', { practicalTitle: 'Practical title of tube' });
    const skill = this.server.create('skill', { name: '@skill2', difficulty: 2, tube });
    const skillSet = this.server.create('skill-set', {
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
    const criterionEverySkillSet = this.server.create('badge-criterion', {
      id: 2,
      scope: 'SkillSet',
      threshold: 40,
      skillSets: [skillSet],
    });

    const badge = this.server.create('badge', {
      id: 1,
      title: 'My badge',
      imageUrl: 'https://images.pix/fr/badges/AG2R.svg',
      isCertifiable: true,
      isAlwaysVisible: true,
      badgeCriteria: [criterionCampaignParticipation, criterionEverySkillSet],
      skillSets: [skillSet],
    });

    // when
    const screen = await visit(`/badges/${badge.id}`);

    // then
    const badgeElement = find('.page-section__details');
    assert.ok(badgeElement.textContent.match(badge.title));
    assert.dom(screen.getByText('20%')).exists();
    assert.dom(screen.getByText('Internet for dummies')).exists();
    assert.dom(screen.getByText('AG2R.svg', { exact: false })).exists();
    assert.dom(screen.getByLabelText('@skill2')).exists();
    assert.dom(screen.getByText('Certifiable')).exists();
    assert.dom(screen.getByText('Lacunes')).exists();
    assert.dom(screen.getByText('Practical title of tube')).exists();
  });
});
