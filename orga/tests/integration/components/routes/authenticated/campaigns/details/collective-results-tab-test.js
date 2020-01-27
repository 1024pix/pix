import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details | collective-results-tab', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display a sentence when there no campaign participation is shared', async function(assert) {
    // given
    const campaignCollectiveResult = run(() => store.createRecord('campaign-collective-result', {
      id: 1,
      campaignId: 1,
      collectiveResultsByCompetence: [],
    }));

    this.set('campaignCollectiveResult', campaignCollectiveResult);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/collective-results-tab campaignCollectiveResult=campaignCollectiveResult}}`);

    // then
    assert.dom('table tbody').doesNotExist();
    assert.dom('.table__empty').hasText('En attente de résultats');
  });

  test('it should display the collective result list of the campaign', async function(assert) {
    // given
    const campaignReport = run(() => store.createRecord('campaign-report', { id: 1, participationsCount: 5, sharedParticipationsCount: 4 }));

    const campaignCompetenceCollectiveResult_1 = run(() => store.createRecord('campaign-competence-collective-result', {
      id: '1_recCompA',
      areaCode: '1',
      areaColor: 'jaffa',
      competenceId: 'recCompA',
      competenceName: 'Competence A',
      averageValidatedSkills: 10,
      totalSkillsCount: 30
    }));

    const campaignCompetenceCollectiveResult_2 = run(() => store.createRecord('campaign-competence-collective-result', {
      id: '2_recCompB',
      areaCode: '2',
      areaColor: 'emerald',
      competenceId: 'recCompB',
      competenceName: 'Competence B',
      averageValidatedSkills: 12.5,
      totalSkillsCount: 50
    }));

    const campaignCollectiveResult = run(() => store.createRecord('campaign-collective-result', {
      id: 1,
      campaignCompetenceCollectiveResults: [campaignCompetenceCollectiveResult_1, campaignCompetenceCollectiveResult_2]
    }));

    this.set('campaignCollectiveResult', campaignCollectiveResult);
    this.set('sharedParticipationsCount', campaignReport.sharedParticipationsCount);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/collective-results-tab 
      campaignCollectiveResult=campaignCollectiveResult 
      sharedParticipationsCount=sharedParticipationsCount}}`
    );

    // then
    assert.dom('.table__empty').doesNotExist();
    assert.dom('table tbody tr:first-child td:first-child span:first-child').hasClass('participant-results-details-competence__bullet--jaffa');
    assert.dom('table tbody tr:first-child td:first-child span:nth-child(2)').hasText('Competence A');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('33%');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('10');
    assert.dom('table tbody tr:first-child td:nth-child(4)').hasText('30');

    assert.dom('table tbody tr:nth-child(2) td:first-child span:first-child').hasClass('participant-results-details-competence__bullet--emerald');
    assert.dom('table tbody tr:nth-child(2) td:first-child span:nth-child(2)').hasText('Competence B');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(2)').hasText('25%');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(3)').hasText('12.5');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(4)').hasText('50');
  });

});
