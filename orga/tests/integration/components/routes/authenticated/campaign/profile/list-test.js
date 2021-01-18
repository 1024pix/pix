import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | routes/authenticated/campaign/profile/list', function(hooks) {
  setupRenderingTest(hooks);
  const goToProfilePage = () => {};
  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  module('when there are profiles', function() {
    test('it should display the profile list', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });

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
      await render(hbs`
        <Routes::Authenticated::Campaign::Profile::List
          @campaign={{campaign}}
          @profiles={{profiles}}
          @goToProfilePage={{goToProfilePage}}
        />`);

      // then
      assert.notContains('En attente de profils');
      assert.contains('Doe');
      assert.contains('Doe2');
      assert.contains('John');
      assert.contains('En attente');
    });

    test('it should display the profile list with external id', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        idPixLabel: 'identifiant externe',
      });

      const profiles = [{ participantExternalId: '123' }];
      profiles.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('profiles', profiles);
      this.set('goToProfilePage', goToProfilePage);

      // when
      await render(hbs`
        <Routes::Authenticated::Campaign::Profile::List
          @campaign={{campaign}}
          @profiles={{profiles}}
          @goToProfilePage={{goToProfilePage}}
        />`);

      // then
      assert.contains('identifiant externe');
      assert.contains('123');
    });

    test('it should display participant certification profile info when shared', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        idPixLabel: 'identifiant externe',
      });

      const profiles = [
        {
          firstName: 'Jane',
          lastName: 'Doe',
          sharedAt: new Date(2020, 1, 1),
          pixScore: 10,
          certifiable: true,
          certifiableCompetencesCount: 5,
        },
      ];
      profiles.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('profiles', profiles);
      this.set('goToProfilePage', goToProfilePage);

      // when
      await render(hbs`
        <Routes::Authenticated::Campaign::Profile::List
          @campaign={{campaign}}
          @profiles={{profiles}}
          @goToProfilePage={{goToProfilePage}}
        />`);

      // then
      assert.contains('01/02/2020');
      assert.contains('10');
      assert.contains('Certifiable');
      assert.contains('5');
    });
  });

  module('when there is no profile', function() {
    test('it should the empty state', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });

      const profiles = [];
      profiles.meta = {
        rowCount: 0,
      };

      this.set('campaign', campaign);
      this.set('profiles', profiles);
      this.set('goToProfilePage', goToProfilePage);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Profile::List @campaign={{campaign}} @profiles={{profiles}} @goToProfilePage={{goToProfilePage}}/>}}`);

      // then
      assert.contains('En attente de profils');
    });
  });

  module('when user works for a SCO organization which manages students', function() {
    class CurrentUserStub extends Service {
      prescriber = { areNewYearSchoolingRegistrationsImported: false }
      isSCOManagingStudents = true;
    }

    test('it displays the division filter', async function(assert) {
      this.owner.register('service:current-user', CurrentUserStub);

      // given
      const division = store.createRecord('division', {
        id: 'd1',
        name: 'd1',
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        stages: [],
        divisions: [division],
      });

      const profiles = [{ firstName: 'John', lastName: 'Doe', isShared: true }];
      profiles.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('profiles', profiles);
      this.set('goToProfilePage', () => {});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Profile::List @campaign={{campaign}} @profiles={{profiles}} @goToProfilePage={{goToProfilePage}}/>}}`);

      // then
      assert.contains('Classes');
      assert.contains('d1');
    });

    test('it filters the profiles when a division is selected', async function(assert) {
      this.owner.register('service:current-user', CurrentUserStub);

      // given
      const division = store.createRecord('division', {
        id: 'd1',
        name: 'd1',
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        stages: [],
        divisions: [division],
      });

      const profiles = [{ firstName: 'John', lastName: 'Doe', isShared: true }];
      profiles.meta = { rowCount: 1 };
      const selectDivisions = sinon.stub();
      this.set('campaign', campaign);
      this.set('profiles', profiles);
      this.set('goToProfilePage', () => {});
      this.set('selectDivisions', selectDivisions);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Profile::List @campaign={{campaign}} @profiles={{profiles}} @goToProfilePage={{goToProfilePage}} @selectDivisions={{selectDivisions}}/>`);
      await click('[for="division-d1"]');

      // then
      assert.ok(selectDivisions.calledWith(['d1']));
    });
  });

  module('when user does not work for a SCO organization which manages students', function() {
    class CurrentUserStub extends Service {
      prescriber = { areNewYearSchoolingRegistrationsImported: false }
      isSCOManagingStudents = false;
    }

    test('it does not display the division filter', async function(assert) {
      this.owner.register('service:current-user', CurrentUserStub);

      // given
      const division = store.createRecord('division', {
        id: 'd2',
        name: 'd2',
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        stages: [],
        divisions: [division],
      });

      const profiles = [{ firstName: 'John', lastName: 'Doe', isShared: true }];
      profiles.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('profiles', profiles);
      this.set('goToProfilePage', () => {});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Profile::List @campaign={{campaign}} @profiles={{profiles}} @goToProfilePage={{goToProfilePage}}/>`);

      // then
      assert.notContains('Classes');
      assert.notContains('d2');
    });
  });
});
