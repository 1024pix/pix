import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Profile', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
  });

  test('it allows user to return to campaign profils page', async function(assert) {
    server.create('campaign', { id: 1 });
    server.create('campaignProfile', { campaignId: 1, campaignParticipationId: 1 });

    // when
    await visit('/campagnes/1/profils/1');
    await click('[aria-label="Retourner au détail de la campagne"]');

    // then
    assert.equal(currentURL(), '/campagnes/1/profils');
  });

  test('it display profile information', async function(assert) {
    server.create('campaign', { id: 2 });
    server.create('campaignProfile', { campaignId: 2, campaignParticipationId: 1, firstName: 'Jules', lastName: 'Winnfield' });

    // when
    await visit('/campagnes/2/profils/1');

    // then
    assert.contains('Jules Winnfield');
  });
});
