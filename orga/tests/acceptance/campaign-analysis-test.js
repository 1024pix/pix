import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Analysis', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.beforeEach(async () => {
    server.logging = true;
    user = createUserWithMembershipAndTermsOfServiceAccepted();
    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
    const campaignAnalysis = server.create('campaign-analysis', 'withTubeRecommendations');
    server.create('campaign', {
      id: 1,
      campaignAnalysis,
    });
  });

  test('it should display campaign analysis', async function(assert) {
    // when
    await visit('/campagnes/1/analyse');

    // then
    assert.dom('[aria-label="Analyse par sujet"]').containsText('Sujets (2)');
  });
});
