import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details/participants | results-item', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  test('it should display a sentence when there is no participant result yet', async function(assert) {
    // given
    const campaignParticipation = store.createRecord('campaignParticipation', {
      isShared: false,
      campaignParticipationResult: null,
    });

    this.set('campaignParticipation', campaignParticipation);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::Participants::ResultsItem @campaignParticipation={{campaignParticipation}} />`);

    // then
    assert.contains('En attente de résultats');
  });

  test('it should display a sentence when participant results have not been shared yet', async function(assert) {
    // given
    const campaignParticipation = store.createRecord('campaignParticipation', {
      isShared: false,
      campaignParticipationResult: {
        totalSkillsCount: 30,
        testedSkillsCount: 29,
        validatedSkillsCount: 15,
        competenceResults: [{
          name: 'Compétence 1',
          index: '1.1',
          totalSkillsCount: 10,
          testedSkillsCount: 9,
          validatedSkillsCount: 5,
          areaColor:'jaffa',
        }],
      },
    });

    this.set('campaignParticipation', campaignParticipation);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::Participants::ResultsItem @campaignParticipation={{campaignParticipation}} />`);

    // then
    assert.contains('En attente de résultats');
  });

  test('it should display participant results', async function(assert) {
    // given
    const competenceResult = store.createRecord('competenceResult', {
      name: 'Compétence 1',
      index: '1.1',
      totalSkillsCount: 10,
      testedSkillsCount: 9,
      validatedSkillsCount: 5,
      areaColor: 'jaffa',
    });

    const campaignParticipationResult = store.createRecord('campaignParticipationResult', {
      totalSkillsCount: 30,
      testedSkillsCount: 29,
      validatedSkillsCount: 15,
      competenceResults: [competenceResult],
    });

    const campaignParticipation = store.createRecord('campaignParticipation', {
      isShared: true,
      campaignParticipationResult,
    });

    this.set('campaignParticipation', campaignParticipation);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::Participants::ResultsItem @campaignParticipation={{campaignParticipation}} />`);

    // then
    assert.dom('[aria-label="Résultats par compétence"]').exists({ count: 1 });
    assert.dom('[aria-label="Résultats par compétence"]').containsText('Compétence 1');
    assert.dom('[aria-label="Résultats par compétence"]').containsText('50%');
    assert.dom('[aria-label="Résultats par compétence"]').containsText('5');
    assert.dom('[aria-label="Résultats par compétence"]').containsText('10');
  });
});
