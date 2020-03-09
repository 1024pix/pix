import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Collective Result', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;
  let campaignReport;

  hooks.beforeEach(async () => {
    server.logging = true;
    user = createUserWithMembershipAndTermsOfServiceAccepted();
    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
    campaignReport = server.create('campaign-report', { sharedParticipationCount: 3 });
  });

  test('it should display campaign competence collective result', async function(assert) {
    // given
    const campaignCollectiveResult = server.create('campaign-collective-result', 'withCompetenceCollectiveResults');
    server.create('campaign', {
      id: 1,
      campaignCollectiveResult,
      campaignReport,
    });

    // when
    await visit('/campagnes/1/resultats-collectifs');

    // then
    assert.dom('.table__empty').doesNotExist();

    assert.dom('table tbody tr:first-child td:first-child span:first-child').hasClass('participant-results-details-line__bullet--jaffa');
    assert.dom('table tbody tr:first-child td:first-child span:nth-child(2)').hasText('Competence A');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('50%');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('5');
    assert.dom('table tbody tr:first-child td:nth-child(4)').hasText('10');
  });

  test('it should display campaign tube collective result', async function(assert) {
    // given
    const campaignCollectiveResult = server.create('campaign-collective-result', 'withTubeCollectiveResults');
    server.create('campaign', {
      id: 1,
      campaignCollectiveResult,
      campaignReport,
    });

    // when
    await visit('/campagnes/1/resultats-collectifs?view=tube');

    // then
    assert.dom('.table__empty').doesNotExist();

    assert.dom('table tbody tr:first-child td:first-child span:first-child').hasClass('participant-results-details-line__bullet--jaffa');
    assert.dom('table tbody tr:first-child td:first-child span:nth-child(2)').hasText('Sujet A');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('50%');
  });
});
