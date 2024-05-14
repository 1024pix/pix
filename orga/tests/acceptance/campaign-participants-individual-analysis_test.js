import { visit as visitScreen } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Acceptance | Campaign Participants Individual Analysis', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let campaignAnalysis;

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser({ user });

    server.create('campaign', { id: 1 });

    await authenticateSession(user.id);
  });

  test('[a11y] it should contain accessibility aria-label nav', async function (assert) {
    // given
    campaignAnalysis = server.create('campaign-analysis', 'withTubeRecommendations', { id: 1, campaignId: 1 });
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAnalysis });

    // when
    const screen = await visitScreen('/campagnes/1/evaluations/1/analyse');

    // then
    assert.dom(screen.getByLabelText('Navigation principale')).exists();
    assert.dom(screen.getByLabelText("Navigation de la section résultat d'une évaluation individuelle")).exists();
    assert.dom(screen.getByLabelText('Navigation de pied de page')).exists();
  });

  test('it should display individual analysis', async function (assert) {
    // given
    campaignAnalysis = server.create('campaign-analysis', 'withTubeRecommendations', { id: 1, campaignId: 1 });
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAnalysis });

    // when
    const screen = await visitScreen('/campagnes/1/evaluations/1/analyse');

    // then
    assert.dom(screen.getByText('Sujets (2)')).exists();
  });

  test('it should not display individual analysis when tube recommendations are empty', async function (assert) {
    // given
    campaignAnalysis = server.create('campaign-analysis', 'withEmptyTubeRecommendations', { id: 1, campaignId: 1 });
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAnalysis });

    // when
    const screen = await visitScreen('/campagnes/1/evaluations/1/analyse');

    // then
    assert.dom(screen.getByText('Sujets (-)')).exists();
  });
});
