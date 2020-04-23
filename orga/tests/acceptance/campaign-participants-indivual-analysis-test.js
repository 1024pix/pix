import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Participants Individual Analysis', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user, campaignAnalysis, participant;

  hooks.beforeEach(async () => {
    user = createUserWithMembershipAndTermsOfServiceAccepted();
    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
    server.create('campaign', { id: 1 });

    participant = server.create('user', { firstName: 'Jack', lastName: 'Doe' });
    campaignAnalysis = server.create('campaign-analysis', 'withTubeRecommendations');
  });

  test('it should display individual analysis when participation is shared', async function(assert) {
    // given
    server.create('campaign-participation', { campaignId: 1, userId: participant.id, campaignAnalysis, isShared: true });

    // when
    await visit('/campagnes/1/participants/1/analyse');

    // then
    assert.dom('[aria-label="Analyse par sujet"]').containsText('Sujets (2)');
  });

  test('it should not display individual analysis when participation is not shared', async function(assert) {
    // given
    server.create('campaign-participation', { campaignId: 1, userId: participant.id, campaignAnalysis, isShared: false });

    // when
    await visit('/campagnes/1/participants/1/analyse');

    // then
    assert.dom('[aria-label="Analyse par sujet"]').containsText('Sujets (-)');
  });
});
