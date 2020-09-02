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

  test('it should display a sentence when displayResults is false', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::Participants::ResultsItem @displayResults={{false}} />`);

    // then
    assert.contains('En attente de résultats');
  });

  test('it should display results when displayResults is true', async function(assert) {
    // given
    const competenceResult = store.createRecord('campaignAssessmentParticipationCompetenceResult', {
      name: 'Compétence 1',
      index: '1.1',
      totalSkillsCount: 10,
      testedSkillsCount: 9,
      validatedSkillsCount: 5,
      areaColor: 'jaffa',
    });

    const campaignAssessmentParticipationResult = store.createRecord('campaignAssessmentParticipationResult', {
      totalSkillsCount: 30,
      testedSkillsCount: 29,
      validatedSkillsCount: 15,
      competenceResults: [competenceResult]
    });

    this.set('campaignAssessmentParticipationResult', campaignAssessmentParticipationResult);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::Participants::ResultsItem @campaignAssessmentParticipationResult={{campaignAssessmentParticipationResult}} @displayResults={{true}} />`);

    // then
    assert.dom('[aria-label="Résultats par compétence"]').exists({ count: 1 });
    assert.dom('[aria-label="Résultats par compétence"]').containsText('Compétence 1');
    assert.dom('[aria-label="Résultats par compétence"]').containsText('50%');
    assert.dom('[aria-label="Résultats par compétence"]').containsText('5');
    assert.dom('[aria-label="Résultats par compétence"]').containsText('10');
  });
});
