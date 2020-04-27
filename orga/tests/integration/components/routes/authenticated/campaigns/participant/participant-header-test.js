import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/participant | participant-header', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
    this.owner.setupRouter();
  });

  test('it should display participant details', async function(assert) {
    // given
    const user = store.createRecord('user', {
      firstName: 'Prénom',
      lastName: 'Nom',
    });

    const campaignParticipationResult = store.createRecord('campaign-participation-result', {
      totalSkillsCount: 30,
      testedSkillsCount: 29,
      validatedSkillsCount: 15,
      isCompleted: true,
      progress: 1
    });

    const campaignParticipation = store.createRecord('campaign-participation', {
      createdAt: '2019-01-07T10:57:31.567Z',
      sharedAt: '2019-02-04T10:57:31.567Z',
      isShared: true,
      participantExternalId: 'mail@pro.net',
      user: user,
      campaignParticipationResult: campaignParticipationResult
    });

    const campaign = store.createRecord('campaign', {
      idPixLabel: 'MailPro',
    });

    this.campaignParticipation = campaignParticipation;
    this.campaign = campaign;

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Participant::ParticipantHeader @campaignParticipation={{campaignParticipation}} @campaign={{campaign}} />`);

    // then
    assert.dom('.page__title').hasText('Prénom Nom');
    assert.dom('.participant-header-content__left-wrapper').hasText('MailPro mail@pro.net');
    assert.dom('.participant-header-content__right-wrapper .participant-content:nth-child(1)').hasText('Avancement 100%');
    assert.dom('.participant-header-content__right-wrapper .participant-content:nth-child(2)').hasText('Commencé le 7 janv. 2019');
    assert.dom('.participant-header-content__right-wrapper .participant-content:nth-child(3)').hasText('Partagé le 4 févr. 2019');
  });

  test('should navigate', async function(assert) {
    // given
    const user = store.createRecord('user', {
      firstName: 'Prénom',
      lastName: 'Nom',
    });

    const campaignParticipationResult  = store.createRecord('campaign-participation-result', {
      totalSkillsCount: 30,
      testedSkillsCount: 29,
      validatedSkillsCount: 15,
      isCompleted: true,
      progress: 1
    });

    const campaignParticipation = store.createRecord('campaign-participation', {
      id: 15,
      createdAt: '2019-01-07T10:57:31.567Z',
      sharedAt: '2019-02-04T10:57:31.567Z',
      isShared: true,
      participantExternalId: 'mail@pro.net',
      user: user,
      campaignParticipationResult: campaignParticipationResult
    });

    const campaign = store.createRecord('campaign', {
      id: 13,
      idPixLabel: 'MailPro',
    });

    this.campaignParticipation = campaignParticipation;
    this.campaign = campaign;

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Participant::ParticipantHeader @campaignParticipation={{campaignParticipation}} @campaign={{campaign}} />`);

    // then
    assert.dom(`nav a[href="/campagnes/${campaign.id}/participants/${campaignParticipation.id}/resultats"]`).hasText('Résultats');
    assert.dom(`nav a[href="/campagnes/${campaign.id}/participants/${campaignParticipation.id}/analyse"]`).hasText('Analyse');
  });
});
