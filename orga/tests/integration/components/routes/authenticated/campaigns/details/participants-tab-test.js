import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details | participants-tab', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  test('it should display the participant list of the campaign with results', async function(assert) {
    // given
    const campaign = store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
    });

    const participants = [
      {
        user: { firstName: 'John', lastName: 'Doe' },
        campaignParticipationResult: { masteryPercentage: 80 },
        participantExternalId: '123',
        isShared: true,
      },
    ];
    participants.meta = {
      rowCount: 1
    };
    const goTo = function() {};

    this.set('campaign', campaign);
    this.set('participants', participants);
    this.set('goToParticipantPage', goTo);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::ParticipantsTab @campaign={{campaign}} @participants={{participants}} @goToParticipantPage={{goToParticipantPage}}/>`);

    // then
    assert.notContains('En attente de participants');
    assert.contains('Doe');
    assert.contains('John');
    assert.contains('80%');
  });

  test('it should display the participant list of the campaign with results pending', async function(assert) {
    // given
    const campaign = store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
    });

    const participants = [
      {
        user: { firstName: 'John', lastName: 'Doe2' },
        campaignParticipationResult: { isCompleted: true },
        participantExternalId: '1234',
        isShared: false,
      },
    ];
    participants.meta = {
      rowCount: 1
    };
    const goTo = function() {};

    this.set('campaign', campaign);
    this.set('participants', participants);
    this.set('goToParticipantPage', goTo);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::ParticipantsTab @campaign={{campaign}} @participants={{participants}} @goToParticipantPage={{goToParticipantPage}}/>`);

    // then
    assert.contains('Doe2');
    assert.contains('John');
    assert.contains('En attente');
  });

  test('it should display the participant list of the campaign with assessment not finished yet', async function(assert) {
    // given
    const campaign = store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
    });

    const participants = [
      {
        user: { firstName: 'John', lastName: 'Doe3' },
        campaignParticipationResult: { isCompleted: false },
        participantExternalId: '12345',
        isShared: false,
      },
    ];
    participants.meta = {
      rowCount: 3
    };
    const goTo = function() {};

    this.set('campaign', campaign);
    this.set('participants', participants);
    this.set('goToParticipantPage', goTo);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::ParticipantsTab @campaign={{campaign}} @participants={{participants}} @goToParticipantPage={{goToParticipantPage}}/>`);

    // then
    assert.contains('Doe3');
    assert.contains('John');
    assert.contains('En cours de test');
  });

  test('it should display the participant list of the campaign with external id', async function(assert) {
    // given
    const campaign = store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
      idPixLabel: 'identifiant externe'
    });

    const participants = [{ user: { firstName: 'John', lastName: 'Doe' }, participantExternalId: '123' }];
    participants.meta = {
      rowCount: 1
    };

    const goTo = function() {};

    this.set('campaign', campaign);
    this.set('participants', participants);
    this.set('goToParticipantPage', goTo);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::ParticipantsTab @campaign={{campaign}} @participants={{participants}} @goToParticipantPage={{goToParticipantPage}}/>`);

    // then
    assert.contains('identifiant externe');
    assert.contains('123');
  });

  test('it should display a sentence when there is no participant yet', async function(assert) {
    // given
    const campaign = store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
    });

    const participants = [];
    participants.meta = {
      rowCount: 0
    };

    this.set('campaign', campaign);
    this.set('participants', participants);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Details::ParticipantsTab @campaign={{campaign}} @participants={{participants}}/>`);

    // then
    assert.contains('En attente de participants');
  });
});
