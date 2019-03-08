import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign | participant-details', function(hooks) {
  setupRenderingTest(hooks);

  let store;
  let user, campaignParticipation, campaignId, campaignParticipationResult;
  hooks.beforeEach(function() {
    campaignId = 1;

    run(() => {
      store = this.owner.lookup('service:store');
    });
    user = run(() => store.createRecord('user', {
      firstName: 'Prénom',
      lastName: 'Nom',
    }));

    campaignParticipationResult  = run(() => store.createRecord('campaign-participation-result', {
      totalSkills: 30,
      testedSkills: 29,
      validatedSkills: 15,
      isCompleted: true,
    }));

    campaignParticipation  = run(() => store.createRecord('campaign-participation', {
      createdAt: '2019-01-07T10:57:31.567Z',
      sharedAt: '2019-02-04T10:57:31.567Z',
      isShared: true,
      participantExternalId: 'mail@pro.net',
      user: user,
      campaignParticipationResult: campaignParticipationResult
    }));

    this.set('campaignParticipation', campaignParticipation);
    this.set('campaignId', campaignId);

  });

  test('it should display user details', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/campaigns/participant-details campaignId=campaignId campaignParticipation=campaignParticipation}}`);

    // then
    assert.dom('.page__title').hasText('Prénom Nom');
    assert.dom('.participant-details-content--first-part').hasText('Identifiant mail@pro.net');
    assert.dom('.participant-details-content:nth-child(2)').hasText('Avancement 100%');
    assert.dom('.participant-details-content:nth-child(3)').hasText('Commencé le 7 jan. 2019');
    assert.dom('.participant-details-content:nth-child(4)').hasText('Partagé le 4 fév. 2019');
    assert.dom('.participant-details-content:nth-child(5)').hasText('Score (Acquis) 15 / 30');
  });


});
