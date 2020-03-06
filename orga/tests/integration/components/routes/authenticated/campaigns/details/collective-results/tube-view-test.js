import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

module('Integration | Component | routes/authenticated/campaigns/details/collective-results/tube-view', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display a sentence when there no campaign participation is shared', async function(assert) {
    // given
    this.set('campaignTubeCollectiveResults', []);
    this.set('sharedParticipationsCount', 0);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResults::TubeView
    @campaignTubeCollectiveResults={{this.campaignTubeCollectiveResults}}
    @sharedParticipationsCount={{this.sharedParticipationsCount}}
  />`);

    // then
    assert.dom('table tbody').doesNotExist();
    assert.dom('.table__empty').hasText('En attente de résultats');
  });

  module('has collective results', function() {
    let campaignTubeCollectiveResult_1;

    hooks.beforeEach(function() {
      // given
      campaignTubeCollectiveResult_1 = store.createRecord('campaign-tube-collective-result', {
        id: '1_recCompA',
        tubeId: 'recCompA',
        tubePracticalTitle: 'Tube A',
        areaColor: 'jaffa',
        averageValidatedSkills: 10,
        totalSkillsCount: 30
      });

      const campaignTubeCollectiveResult_2 = store.createRecord('campaign-tube-collective-result', {
        id: '2_recCompB',
        tubeId: 'recCompB',
        tubePracticalTitle: 'Tube B',
        areaColor: 'emerald',
        averageValidatedSkills: 12.5,
        totalSkillsCount: 50
      });

      this.set('campaignTubeCollectiveResults', [campaignTubeCollectiveResult_1, campaignTubeCollectiveResult_2]);
      this.set('sharedParticipationsCount', 4);
    });

    test('it should not display empty results message', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResults::TubeView
      @campaignTubeCollectiveResults={{this.campaignTubeCollectiveResults}}
      @sharedParticipationsCount={{this.sharedParticipationsCount}}
    />`);

      // then
      assert.dom('.table__empty').doesNotExist();
    });

    test('it should display the collective result list of the campaign', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResults::TubeView
      @campaignTubeCollectiveResults={{this.campaignTubeCollectiveResults}}
      @sharedParticipationsCount={{this.sharedParticipationsCount}}
    />`);

      // then
      assert.dom('[aria-label="Sujet"]').exists({ count: 2 });
    });

    test('it should display tube details', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::CollectiveResults::TubeView
      @campaignTubeCollectiveResults={{this.campaignTubeCollectiveResults}}
      @sharedParticipationsCount={{this.sharedParticipationsCount}}
    />`);

      // then
      assert.dom('[aria-label="Sujet"]:first-child').containsText('Tube A');
      assert.dom('[aria-label="Sujet"]:first-child').containsText('33%');
    });
  });
});
