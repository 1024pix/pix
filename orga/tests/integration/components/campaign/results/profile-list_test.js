import sinon from 'sinon';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | Campaign::Results::ProfileList', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('when there are profiles', function () {
    test('it should display the profile list', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        participationsCount: 1,
      });
      this.profiles = [
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
      this.profiles.meta = { rowCount: 2 };
      this.onClickParticipant = sinon.stub();

      // when
      await render(hbs`<Campaign::Results::ProfileList
        @campaign={{campaign}}
        @profiles={{profiles}}
        @onClickParticipant={{onClickParticipant}}
      />`);

      // then
      assert.notContains('En attente de profils');
      assert.contains('Doe');
      assert.contains('Doe2');
      assert.contains('John');
      assert.contains("En attente d'envoi");
    });

    test('it should display the profile list with external id', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        idPixLabel: 'identifiant externe',
        participationsCount: 1,
      });
      this.profiles = [{ participantExternalId: '123' }];
      this.profiles.meta = { rowCount: 1 };
      this.onClickParticipant = sinon.stub();

      // when
      await render(hbs`<Campaign::Results::ProfileList
        @campaign={{campaign}}
        @profiles={{profiles}}
        @onClickParticipant={{onClickParticipant}}
      />`);

      // then
      assert.contains('identifiant externe');
      assert.contains('123');
    });

    test('it should display participant certification profile info when shared', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        idPixLabel: 'identifiant externe',
        participationsCount: 1,
      });
      this.profiles = [
        {
          firstName: 'Jane',
          lastName: 'Doe',
          sharedAt: new Date(2020, 1, 1),
          pixScore: 10,
          certifiable: true,
          certifiableCompetencesCount: 5,
        },
      ];
      this.profiles.meta = { rowCount: 1 };
      this.onClickParticipant = sinon.stub();

      // when
      await render(hbs`<Campaign::Results::ProfileList
        @campaign={{campaign}}
        @profiles={{profiles}}
        @onClickParticipant={{onClickParticipant}}
      />`);

      // then
      assert.contains('01/02/2020');
      assert.contains('10');
      assert.contains('Certifiable');
      assert.contains('5');
    });

    test('it should display a link to access participant profile', async function (assert) {
      // given
      this.owner.setupRouter();
      this.campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        code: 'AAAAAA111',
        participationsCount: 1,
      });
      this.profiles = [
        {
          id: 7,
          lastName: 'Todori',
          firstName: 'Shoto',
        },
      ];
      this.onClickParticipant = sinon.stub();

      // when
      await render(hbs`<Campaign::Results::ProfileList
        @campaign={{campaign}}
        @profiles={{profiles}}
        @onClickParticipant={{onClickParticipant}}
      />`);

      // then
      assert.dom('a[href="/campagnes/1/profils/7"]').exists();
    });
  });

  module('when there is no profile', function () {
    test('it should display no profil when hasParticipations filtered', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        participationsCount: 1,
      });
      this.profiles = [];
      this.profiles.meta = { rowCount: 0 };
      this.onClickParticipant = sinon.stub();

      // when
      await render(hbs`<Campaign::Results::ProfileList
        @campaign={{campaign}}
        @profiles={{profiles}}
        @onClickParticipant={{onClickParticipant}}
      />`);

      // then
      assert.contains('En attente de profils');
    });
  });

  module('when user works for a SCO organization which manages students', function () {
    class CurrentUserStub extends Service {
      prescriber = { areNewYearSchoolingRegistrationsImported: false };
      isSCOManagingStudents = true;
    }

    test('it filters the profiles when a division is selected', async function (assert) {
      // given
      this.owner.register('service:current-user', CurrentUserStub);
      const division = store.createRecord('division', {
        id: 'd1',
        name: 'd1',
      });
      this.campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        stages: [],
        participationsCount: 1,
      });
      this.campaign.set('divisions', [division]);
      this.profiles = [{ firstName: 'John', lastName: 'Doe', isShared: true }];
      this.profiles.meta = { rowCount: 1 };
      this.onClickParticipant = sinon.stub();
      this.onFilter = sinon.stub();

      // when
      await render(hbs`<Campaign::Results::ProfileList
        @campaign={{campaign}}
        @profiles={{profiles}}
        @onClickParticipant={{onClickParticipant}}
        @onFilter={{onFilter}}
      />`);
      await click('[for="division-d1"]');

      // then
      assert.ok(this.onFilter.calledWith({ divisions: ['d1'] }));
    });
  });
});
