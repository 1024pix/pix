import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Participants Details', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.beforeEach(async () => {
    user = createUserWithMembershipAndTermsOfServiceAccepted();
    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
    const campaignCollectiveResult = server.create('campaign-collective-result', 'withCompetenceCollectiveResults');
    server.create('campaign', { id: 1, campaignCollectiveResult });

    const participant = server.create('user', { firstName: 'Jack', lastName: 'Doe' });
    server.create('campaign-participation', { campaignId: 1, userId: participant.id });
  });

  test('it should display user details', async function(assert) {
    // when
    await visit('/campagnes/1/participants/1');

    // then
    assert.dom('.page__title').hasText('Jack Doe');
  });
});
