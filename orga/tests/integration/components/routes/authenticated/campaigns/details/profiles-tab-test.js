import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details | profiles-tab', function(hooks) {
  setupRenderingTest(hooks);
  const goToProfilePage = () => {};
  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  module('when there are profiles', function() {
    test('it should display the participant list', async function(assert) {
      // given
      const campaign = run(() => store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      }));

      const profiles = [
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
      profiles.meta = {
        rowCount: 2,
      };

      this.set('campaign', campaign);
      this.set('profiles', profiles);
      this.set('goToProfilePage', goToProfilePage);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::ProfilesTab @campaign={{campaign}} @profiles={{profiles}} @goToProfilePage={{goToProfilePage}}/>}}`);

      // then
      assert.notContains('En attente de profiles');
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

      const profiles = [{ participantExternalId: '123' }];
      profiles.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('profiles', profiles);
      this.set('goToProfilePage', goToProfilePage);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::ProfilesTab @campaign={{campaign}} @profiles={{profiles}} @goToProfilePage={{goToProfilePage}}/>}}`);

      // then
      assert.contains('identifiant externe');
      assert.contains('123');
    });

    test('it should display participant certification profile info when shared', async function(assert) {
      // given
      const campaign = run(() => store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        idPixLabel: 'identifiant externe'
      }));

      const participants = [
        { 
          firstName: 'Jane',
          lastName: 'Doe',
          sharedAt: new Date(2020, 1, 1),
          pixScore: 10,
          certifiable: true,
          certifiableCompetencesCount: 5,
        }
      ];
      participants.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participants', participants);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::ProfilesTab @campaign={{campaign}} @participants={{participants}}/>}}`);

      // then
      assert.contains('01/02/2020');
      assert.contains('10');
      assert.contains('true');
      assert.contains('5');
    });
  });

  module('when there aren\'t profiles', function() {
    test('it should the empty state of participants list', async function(assert) {
      // given
      const campaign = run(() => store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      }));

      const profiles = [];
      profiles.meta = {
        rowCount: 0,
      };

      this.set('campaign', campaign);
      this.set('profiles', profiles);
      this.set('goToProfilePage', goToProfilePage);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::ProfilesTab @campaign={{campaign}} @profiles={{profiles}} @goToProfilePage={{goToProfilePage}}/>}}`);

      // then
      assert.contains('En attente de profiles');
    });
  });
});
