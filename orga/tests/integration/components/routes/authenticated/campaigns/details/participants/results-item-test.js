import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details/participants | results-item', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display a sentence when there is no result yet', async function (assert) {
    // given
    const campaignParticipation = run(() => store.createRecord('campaignParticipation', {
      isShared: false,
      campaignParticipationResult: null
    }));

    this.set('campaignParticipation', campaignParticipation);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/participants/results-item campaignParticipation=campaignParticipation}}`);

    // then
    assert.dom('.participant-results-content--multiple .content-text--big').hasText('-');
    assert.dom('.table__empty').hasText('En attente de résultats');
  });

  test('it should display a sentence when the results have not been shared yet', async function (assert) {
    // given
    const campaignParticipation = run(() => store.createRecord('campaignParticipation', {
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
        }]
      }
    }));

    this.set('campaignParticipation', campaignParticipation);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/participants/results-item campaignParticipation=campaignParticipation}}`);

    // then
    assert.dom('.participant-results-content--multiple .content-text--big').hasText('-');
    assert.dom('.table__empty').hasText('En attente de résultats');
  });

  test('it should display the results', async function (assert) {
    // given
    const competenceResult = run(() => store.createRecord('competenceResult', {
      name: 'Compétence 1',
      index: '1.1',
      totalSkillsCount: 10,
      testedSkillsCount: 9,
      validatedSkillsCount: 5,
    }));

    const campaignParticipationResult = run(() => store.createRecord('campaignParticipationResult', {
      totalSkillsCount: 30,
      testedSkillsCount: 29,
      validatedSkillsCount: 15,
      competenceResults: [competenceResult]
    }));

    const campaignParticipation = run(() => store.createRecord('campaignParticipation', {
      isShared: true,
      campaignParticipationResult
    }));

    this.set('campaignParticipation', campaignParticipation);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/participants/results-item campaignParticipation=campaignParticipation}}`);

    // then
    assert.dom('.participant-results-content--multiple .participant-results-content .content-text--big').hasText('1');
    assert.dom('.participant-results-content--multiple .participant-results-content:nth-child(2) .content-text--big').hasText('15');
    assert.dom('.participant-results-content--multiple .participant-results-content:nth-child(3) .content-text--big').hasText('30');
    assert.dom('table tbody tr td span:nth-child(2)').hasText('Compétence 1');
    assert.dom('.participant-results-content__circle-chart-value').hasText('50%');
  });
});






