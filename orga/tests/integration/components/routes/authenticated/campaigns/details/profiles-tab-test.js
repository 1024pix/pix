import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details | profiles-tab', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  module('when there are participants', function() {
    test('it should display the participant list', async function(assert) {
      // given
      const campaign = run(() => store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      }));

      const participants = [
        {
          firstName: 'John',
          lastName: 'Doe',
          participantExternalId: '123',
          sharedAt: new Date(2020, 1, 1),
        },
        {
          firstName: 'John',
          lastName: 'Doe2',
          participantExternalId: '1234',
          sharedAt: null,
        },
      ];

      this.set('campaign', campaign);
      this.set('participants', participants);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::ProfilesTab @campaign={{campaign}} @participants={{participants}}/>}}`);

      // then
      assert.notContains('En attente de participants');
      assert.contains('Doe');
      assert.contains('Doe2');
      assert.contains('John');
      assert.contains('En attente');
    });

    test('it should display the participant list of the campaign with external id', async function(assert) {
      // given
      const campaign = run(() => store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        idPixLabel: 'identifiant externe'
      }));

      const participants = [{ user: { firstName: 'Jane', lastName: 'Doe' }, participantExternalId: '123' }];

      this.set('campaign', campaign);
      this.set('participants', participants);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::ProfilesTab @campaign={{campaign}} @participants={{participants}}/>}}`);

      // then
      assert.contains('identifiant externe');
      assert.contains('123');
    });
  });

  module('when there are participants', function() {
    test('it should the empty state of participants list', async function(assert) {
      // given
      const campaign = run(() => store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      }));

      const participants = [];

      this.set('campaign', campaign);
      this.set('participants', participants);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::ProfilesTab @campaign={{campaign}} @participants={{participants}}/>}}`);

      // then
      assert.contains('En attente de participants');
    });
  });
});
