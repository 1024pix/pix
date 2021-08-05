import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Participants Individual Results', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    server.create('campaign', { id: 1 });

    await authenticateSession(user.id);
  });

  test('it should display individual results', async function(assert) {
    // given
    const campaignAssessmentParticipationResult = server.create('campaign-assessment-participation-result', 'withCompetenceResults', { id: 1, campaignId: 1 });
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });

    // when
    await visit('/campagnes/1/evaluations/1');

    // then
    assert.contains('Compétences (2)');
  });

  test('it should not display individual results when competence results are empty', async function(assert) {
    // given
    const campaignAssessmentParticipationResult = server.create('campaign-assessment-participation-result', 'withEmptyCompetenceResults', { id: 1, campaignId: 1 });
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });

    // when
    await visit('/campagnes/1/evaluations/1');

    // then
    assert.contains('Compétences (-)');
  });
});
