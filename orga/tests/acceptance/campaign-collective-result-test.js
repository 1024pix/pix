import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Collective Result', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    const campaignReport = server.create('campaign-report', { sharedParticipationCount: 3 });
    const campaignCollectiveResult = server.create('campaign-collective-result', 'withCompetenceCollectiveResults');
    server.create('campaign', { id: 1, campaignCollectiveResult, campaignReport });

    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
  });

  test('it should display campaign collective result', async function(assert) {
    // when
    await visit('/campagnes/1/resultats-collectifs');

    // then
    assert.dom('.table__empty').doesNotExist();

    assert.dom('table tbody tr:first-child td:first-child span:first-child').hasClass('competences-col__border--jaffa');
    assert.dom('table tbody tr:first-child td:first-child span:nth-child(2)').hasText('Competence A');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('50%');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('5');
    assert.dom('table tbody tr:first-child td:nth-child(4)').hasText('10');
  });
});
