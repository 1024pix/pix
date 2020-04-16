import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details/participants | participant-header', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
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
      progress: 1
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
    await render(hbs`<Routes::Authenticated::Campaigns::Details::Participants::ParticipantHeader @campaignParticipation={{campaignParticipation}} @campaign={{campaign}} />`);

    // then
    assert.dom('.page__title').hasText('Prénom Nom');
    assert.dom('.participant-header-content__left-wrapper').hasText('MailPro mail@pro.net');
    assert.dom('.participant-header-content__right-wrapper .participant-content:nth-child(1)').hasText('Avancement 100%');
    assert.dom('.participant-header-content__right-wrapper .participant-content:nth-child(2)').hasText('Commencé le 7 janv. 2019');
    assert.dom('.participant-header-content__right-wrapper .participant-content:nth-child(3)').hasText('Partagé le 4 févr. 2019');
  });
});
