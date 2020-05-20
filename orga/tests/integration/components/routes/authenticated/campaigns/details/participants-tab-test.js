import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details | participants-tab', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display the participant list of the campaign', async function(assert) {
    // given
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
    }));

    const participants = [
      {
        user: { firstName: 'John', lastName: 'Doe' },
        campaignParticipationResult: { masteryPercentage: 80 },
        participantExternalId: '123',
        isShared: true,
      },
      {
        user: { firstName: 'John', lastName: 'Doe2' },
        campaignParticipationResult: { isCompleted: true },
        participantExternalId: '1234',
        isShared: false,
      },
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
    await render(hbs`{{routes/authenticated/campaigns/details/participants-tab campaign=campaign participants=participants goToParticipantPage=goToParticipantPage}}`);

    // then
    assert.dom('.participant-list__no-participants').doesNotExist();
    assert.dom('table tbody tr:first-child td:first-child').hasText('Doe');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('John');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('80%');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(3)').hasText('En attente');
    assert.dom('table tbody tr:nth-child(3) td:nth-child(3)').hasText('En cours de test');
  });

  test('it should display the participant list of the campaign with external id', async function(assert) {
    // given
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
      idPixLabel: 'identifiant externe'
    }));

    const participants = [{ user: { firstName: 'John', lastName: 'Doe' }, participantExternalId: '123' }];
    participants.meta = {
      rowCount: 1
    };

    const goTo = function() {};

    this.set('campaign', campaign);
    this.set('participants', participants);
    this.set('goToParticipantPage', goTo);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/participants-tab campaign=campaign participants=participants goToParticipantPage=goToParticipantPage}}`);

    // then
    assert.contains('identifiant externe');
    assert.contains('123');
  });

  test('it should display a sentence when there is no participant yet', async function(assert) {
    // given
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
    }));

    const participants = [];
    participants.meta = {
      rowCount: 0
    };

    this.set('campaign', campaign);
    this.set('participants', participants);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/participants-tab campaign=campaign participants=participants}}`);

    // then
    assert.dom('table tbody').doesNotExist();
    assert.dom('.table__empty').hasText('En attente de participants');
  });
});
