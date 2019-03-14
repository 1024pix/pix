import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details | participants-tab', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display the participant list of the campaign', async function (assert) {
    // given
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
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
    assert.dom('.participant-list__header').hasText(`Liste des participants (${participants.meta.rowCount})`);
    assert.dom('.participant-list__no-participants').doesNotExist();
    assert.dom('.table tbody tr td:first-child').hasText('Doe');
    assert.dom('.table tbody tr td:nth-child(2)').hasText('John');
    assert.dom('.table tbody tr td:nth-child(3)').doesNotExist();
  });

  test('it should display the participant list of the campaign with external id', async function (assert) {
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
    assert.dom('.participant-list__header').hasText(`Liste des participants (${participants.meta.rowCount})`);
    assert.dom('.table tbody tr td:first-child').hasText('Doe');
    assert.dom('.table tbody tr td:nth-child(2)').hasText('John');
    assert.dom('.table tbody tr td:nth-child(3)').hasText('123');
  });

  test('it should display a sentence when there is no participant yet', async function (assert) {
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
    assert.dom('.participant-list__header').hasText(`Liste des participants (${participants.meta.rowCount})`);
    assert.dom('.table tbody').doesNotExist();
    assert.dom('.participant-list__no-participants').hasText('En attente de participants');
  });
});
