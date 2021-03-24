import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Participants Results', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    server.create('campaign', { id: 1 });
    const campaignAssessmentParticipationResult = server.create('campaign-assessment-participation-result', 'withCompetenceResults', { id: 1, campaignId: 1 });
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult, lastName: 'Bacri' });
    server.create('campaign-assessment-participation-summary', { id: 1, lastName: 'Bacri' });

    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
  });

  module('When prescriber arrives on participants page', () => {

    test('it could click on user to go to details', async function(assert) {
      // when
      await visit('/campagnes/1/evaluations');
      await clickByLabel('Bacri');

      // then
      assert.equal(currentURL(), '/campagnes/1/evaluations/1/resultats');
    });

    test('it could return on list of participants', async function(assert) {
      // when
      await visit('/campagnes/1/evaluations/1');
      await clickByLabel('Retour');

      // then
      assert.equal(currentURL(), '/campagnes/1/evaluations');
    });
  });

});
