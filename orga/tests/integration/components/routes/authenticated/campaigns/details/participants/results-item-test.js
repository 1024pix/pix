import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details/participants | results-item', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display a sentence when there is no participant result yet', async function(assert) {
    // given
    const campaignParticipation = run(() => store.createRecord('campaignParticipation', {
      isShared: false,
      campaignParticipationResult: null
    }));

    this.set('campaignParticipation', campaignParticipation);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/participants/results-item campaignParticipation=campaignParticipation}}`);

    // then
    assert.dom('.participant-results-content__summary .content-text--big').hasText('-');
    assert.dom('.table__empty').hasText('En attente de résultats');
  });

  test('it should display a sentence when participant results have not been shared yet', async function(assert) {
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
          areaColor:'jaffa',
        }]
      }
    }));

    this.set('campaignParticipation', campaignParticipation);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/participants/results-item campaignParticipation=campaignParticipation}}`);

    // then
    assert.dom('.participant-results-content__summary .content-text--big').hasText('-');
    assert.dom('.table__empty').hasText('En attente de résultats');
  });

  test('it should display participant results', async function(assert) {
    // given
    const competenceResult = run(() => store.createRecord('competenceResult', {
      name: 'Compétence 1',
      index: '1.1',
      totalSkillsCount: 10,
      testedSkillsCount: 9,
      validatedSkillsCount: 5,
      areaColor: 'jaffa',
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
    assert.dom('.participant-results-content__summary .participant-results-content:nth-child(1) .content-text--big').hasText('15');
    assert.dom('.participant-results-content__summary .participant-results-content:nth-child(2) .content-text--big').hasText('30');
    assert.dom('.participant-results-content__circle-chart-value').hasText('50%');

    assert.dom('table tbody tr').exists({ count: 1 });
    assert.dom('table tbody tr td span:first-child').hasClass('participant-results-details-line__bullet--jaffa');
    assert.dom('table tbody tr td span:nth-child(2)').hasText('Compétence 1');
    assert.dom('table tbody tr td:nth-child(2)').containsText('50%');
    assert.dom('table tbody tr td:nth-child(3)').hasText('5');
    assert.dom('table tbody tr td:nth-child(4)').hasText('10');
  });

  test('it should display participant details', async function(assert) {
    // given
    const user = run(() => store.createRecord('user', {
      firstName: 'Prénom',
      lastName: 'Nom',
    }));

    const campaignParticipationResult  = run(() => store.createRecord('campaign-participation-result', {
      totalSkillsCount: 30,
      testedSkillsCount: 29,
      validatedSkillsCount: 15,
      isCompleted: true,
    }));

    const campaignParticipation  = run(() => store.createRecord('campaign-participation', {
      createdAt: '2019-01-07T10:57:31.567Z',
      sharedAt: '2019-02-04T10:57:31.567Z',
      isShared: true,
      participantExternalId: 'mail@pro.net',
      user: user,
      campaignParticipationResult: campaignParticipationResult
    }));

    const campaign  = run(() => store.createRecord('campaign', {
      idPixLabel: 'MailPro',
    }));

    this.set('campaignParticipation', campaignParticipation);
    this.set('campaign', campaign);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/participants/results-item campaignParticipation=campaignParticipation campaign=campaign}}`);

    // then
    assert.dom('.page__title').hasText('Prénom Nom');
    assert.dom('.participant-results-content__left-wrapper').hasText('MailPro mail@pro.net');
    assert.dom('.participant-results-content__right-wrapper .participant-results-content:nth-child(1)').hasText('Avancement 100%');
    assert.dom('.participant-results-content__right-wrapper .participant-results-content:nth-child(2)').hasText('Commencé le 7 janv' +
      '. 2019');
    assert.dom('.participant-results-content__right-wrapper .participant-results-content:nth-child(3)').hasText('Partagé le 4 févr. 2019');
  });
});

