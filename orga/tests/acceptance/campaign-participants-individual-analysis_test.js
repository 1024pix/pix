import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Participants Individual Analysis', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let campaignAnalysis;

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    server.create('campaign', { id: 1 });

    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
  });

  test('it should display individual analysis', async function(assert) {
    // given
    campaignAnalysis = server.create('campaign-analysis', 'withTubeRecommendations', { id: 1, campaignId: 1 });
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAnalysis });

    // when
    await visit('/campagnes/1/evaluations/1/analyse');

    // then
    assert.dom('[aria-label="Analyse par sujet"]').containsText('Sujets (2)');
  });

  test('it should not display individual analysis when tube recommendations are empty', async function(assert) {
    // given
    campaignAnalysis = server.create('campaign-analysis', 'withEmptyTubeRecommendations', { id: 1, campaignId: 1 });
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAnalysis });

    // when
    await visit('/campagnes/1/evaluations/1/analyse');

    // then
    assert.dom('[aria-label="Analyse par sujet"]').containsText('Sujets (-)');
  });
});
