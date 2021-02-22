import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/collective-results/tab', function(hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  test('it should display a sentence when there no campaign participation is shared', async function(assert) {
    // given
    const campaignCollectiveResult = store.createRecord('campaign-collective-result', {
      id: 1,
      campaignId: 1,
      collectiveResultsByCompetence: [],
    });

    this.set('campaignCollectiveResult', campaignCollectiveResult);

    // when
    await render(hbs`<Routes::Authenticated::Campaign::CollectiveResults::Tab @campaignCollectiveResult={{campaignCollectiveResult}}/>`);

    // then
    assert.contains('En attente de résultats');
  });

  test('it should display the collective result list of the campaign', async function(assert) {
    // given
    const campaignCompetenceCollectiveResult = store.createRecord('campaign-competence-collective-result', {
      id: '1_recCompA',
      areaCode: '1',
      areaColor: 'jaffa',
      competenceId: 'recCompA',
      competenceName: 'Competence A',
      averageValidatedSkills: 10,
      targetedSkillsCount: 30,
    });

    const campaignCollectiveResult = store.createRecord('campaign-collective-result', {
      id: 1,
      campaignCompetenceCollectiveResults: [campaignCompetenceCollectiveResult],
    });

    this.set('campaignCollectiveResult', campaignCollectiveResult);
    this.set('sharedParticipationsCount', 4);

    // when
    await render(hbs`<Routes::Authenticated::Campaign::CollectiveResults::Tab
      @campaignCollectiveResult={{campaignCollectiveResult}}
      @sharedParticipationsCount={{sharedParticipationsCount}}/>`,
    );

    // then
    assert.notContains('En attente de résultats');
    const firstCompetence = '[aria-label="Compétence"]:first-child';
    assert.dom(firstCompetence).containsText('Competence A');
    assert.dom(firstCompetence).containsText('33%');
    assert.dom(firstCompetence).containsText('10');
    assert.dom(firstCompetence).containsText('30');
  });
});
