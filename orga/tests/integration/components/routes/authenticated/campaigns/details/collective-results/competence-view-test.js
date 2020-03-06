import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

module('Integration | Component | routes/authenticated/campaigns/details/collective-results/competence-view', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display a sentence when there no campaign participation is shared', async function(assert) {
    // given
    this.set('campaignCompetenceCollectiveResults', []);
    this.set('sharedParticipationsCount', 0);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResults::CompetenceView
    @campaignCompetenceCollectiveResults={{this.campaignCompetenceCollectiveResults}}
    @sharedParticipationsCount={{this.sharedParticipationsCount}}
  />`);

    // then
    assert.dom('table tbody').doesNotExist();
    assert.dom('.table__empty').hasText('En attente de résultats');
  });

  module('has collective results', function() {
    let campaignCompetenceCollectiveResult_1;

    hooks.beforeEach(function() {
      campaignCompetenceCollectiveResult_1 = store.createRecord('campaign-competence-collective-result', {
        id: '1_recCompA',
        areaCode: '1',
        areaColor: 'jaffa',
        competenceId: 'recCompA',
        competenceName: 'Competence A',
        averageValidatedSkills: 10,
        totalSkillsCount: 30
      });

      const campaignCompetenceCollectiveResult_2 = store.createRecord('campaign-competence-collective-result', {
        id: '2_recCompB',
        areaCode: '2',
        areaColor: 'emerald',
        competenceId: 'recCompB',
        competenceName: 'Competence B',
        averageValidatedSkills: 12.5,
        totalSkillsCount: 50
      });

      this.set('campaignCompetenceCollectiveResults', [campaignCompetenceCollectiveResult_1, campaignCompetenceCollectiveResult_2]);
      this.set('sharedParticipationsCount', 4);
    });

    test('it should not display empty result message', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResults::CompetenceView
      @campaignCompetenceCollectiveResults={{this.campaignCompetenceCollectiveResults}}
      @sharedParticipationsCount={{this.sharedParticipationsCount}}
    />`);

      // then
      assert.dom('.table__empty').doesNotExist();
    });

    test('it should display the collective result list of the campaign', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResults::CompetenceView
      @campaignCompetenceCollectiveResults={{this.campaignCompetenceCollectiveResults}}
      @sharedParticipationsCount={{this.sharedParticipationsCount}}
    />`);

      // then
      assert.dom('[aria-label="Compétence"]').exists({ count: 2 });
    });

    test('it should display competence details', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResults::CompetenceView
      @campaignCompetenceCollectiveResults={{this.campaignCompetenceCollectiveResults}}
      @sharedParticipationsCount={{this.sharedParticipationsCount}}
    />`);

      // then
      assert.dom('[aria-label="Compétence"]:first-child').containsText('•');
      assert.dom('[aria-label="Compétence"]:first-child').containsText('Competence A');
      assert.dom('[aria-label="Compétence"]:first-child').containsText('33%');
      assert.dom('[aria-label="Compétence"]:first-child').containsText('10');
      assert.dom('[aria-label="Compétence"]:first-child').containsText('30');
    });
  });
});
