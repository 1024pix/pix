import { render, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ProfileList from 'pix-orga/components/campaign/results/profile-list';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Results::ProfileList', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  const noop = sinon.stub();
  const divisions = [];
  const groups = [];

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('table informations', function () {
    test('it should display table caption', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
      });
      const profiles = [];
      profiles.meta = { rowCount: 0 };

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByRole('table', { name: t('pages.profiles-list.table.caption') }));
    });
  });

  module('table headers', function () {
    test('it should display evolution header with tooltip and shared profile count when campaign is multiple sendings', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
        multipleSendings: true,
      });
      const profiles = [];
      profiles.meta = { rowCount: 0 };

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      // then
      const evolutionHeader = screen.getByRole('columnheader', {
        name: t('pages.profiles-list.table.column.evolution'),
      });
      assert.ok(within(evolutionHeader).getByText(t('pages.profiles-list.table.evolution-tooltip.content')));
      assert.ok(
        screen.getByRole('columnheader', { name: t('pages.profiles-list.table.column.ariaSharedProfileCount') }),
      );
    });

    test('it should not display evolution header or shared profile count if campaign is not multiple sendings', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
        multipleSendings: false,
      });
      const profiles = [];
      profiles.meta = { rowCount: 0 };

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByRole('columnheader', { name: t('pages.profiles-list.table.column.evolution') }));
      assert.notOk(
        screen.queryByRole('columnheader', { name: t('pages.profiles-list.table.column.ariaSharedProfileCount') }),
      );
    });
  });

  module('when there are profiles', function () {
    test('it should display the profile list', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
      });
      const profiles = [
        {
          firstName: 'John',
          lastName: 'Doe',
          participantExternalId: '123',
          sharedAt: new Date(2020, 1, 1),
        },
        {
          firstName: 'Patrick',
          lastName: 'Doe2',
          participantExternalId: '1234',
          sharedAt: null,
        },
      ];
      profiles.meta = { rowCount: 2 };

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByText('En attente de profils'));
      assert.ok(screen.getByRole('cell', { name: 'Doe' }));
      assert.ok(screen.getByRole('cell', { name: 'Doe2' }));
      assert.ok(screen.getByRole('cell', { name: 'John' }));
      assert.ok(screen.getByRole('cell', { name: 'Patrick' }));
      assert.ok(screen.getByRole('cell', { name: "En attente d'envoi" }));
      assert.ok(screen.getByRole('cell', { name: '01/02/2020' }));
    });

    test('it should not display evolution if campaign is not multiple sendings', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
        multipleSendings: false,
      });
      const profiles = [
        {
          firstName: 'Alice',
          lastName: 'Red',
          participantExternalId: '789',
          evolution: null,
          sharedAt: new Date(2020, 1, 1),
        },
      ];
      profiles.meta = { rowCount: 1 };

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByRole('cell', { name: t('pages.profiles-list.table.evolution.unavailable') }));
    });

    test('it should display correct evolution if campaign is multiple sendings', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 4,
        multipleSendings: true,
      });
      const profiles = [
        {
          firstName: 'John',
          lastName: 'Doe',
          participantExternalId: '123',
          evolution: 'decrease',
          sharedAt: new Date(2020, 1, 1),
        },
        {
          firstName: 'Donald',
          lastName: 'Goose',
          participantExternalId: '321',
          evolution: 'increase',
          sharedAt: new Date(2020, 1, 1),
        },
        {
          firstName: 'James',
          lastName: 'Green',
          participantExternalId: '456',
          evolution: 'stable',
          sharedAt: new Date(2020, 1, 1),
        },
        {
          firstName: 'Alice',
          lastName: 'Red',
          participantExternalId: '789',
          evolution: null,
          sharedAt: new Date(2020, 1, 1),
        },
      ];
      profiles.meta = { rowCount: 4 };

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      const rows = screen.getAllByRole('row');

      // then
      assert.ok(within(rows[1]).getByRole('cell', { name: t('pages.profiles-list.table.evolution.decrease') }));
      assert.ok(within(rows[2]).getByRole('cell', { name: t('pages.profiles-list.table.evolution.increase') }));
      assert.ok(within(rows[3]).getByRole('cell', { name: t('pages.profiles-list.table.evolution.stable') }));
      assert.ok(within(rows[4]).getByRole('cell', { name: t('pages.profiles-list.table.evolution.unavailable') }));
    });

    test('it should display number of profiles shares if campaign is multiple sendings', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
        multipleSendings: true,
      });
      const profiles = [
        {
          firstName: 'John',
          lastName: 'Doe',
          participantExternalId: '123',
          sharedProfileCount: 'My profileCount',
          evolution: 'decrease',
          sharedAt: new Date(2020, 1, 1),
        },
      ];
      profiles.meta = { rowCount: 1 };

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByRole('cell', { name: 'My profileCount' }));
    });

    test('it should not display number of profiles shares if campaign is not multiple sendings', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
        multipleSendings: false,
      });
      const profiles = [
        {
          firstName: 'John',
          lastName: 'Doe',
          participantExternalId: '123',
          sharedProfileCount: 'My profileCount',
          sharedAt: new Date(2020, 1, 1),
        },
      ];
      profiles.meta = { rowCount: 1 };

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByRole('cell', { name: 'My profileCount' }));
    });

    test('it should display the profile list with external id', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        externalIdLabel: 'identifiant externe',
        participationsCount: 1,
      });
      const profiles = [{ participantExternalId: '123' }];
      profiles.meta = { rowCount: 1 };

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByRole('columnheader', { name: 'identifiant externe' }));
      assert.ok(screen.getByRole('cell', { name: '123' }));
    });

    test('it should display participant certification profile info when shared', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        externalIdLabel: 'identifiant externe',
        participationsCount: 1,
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

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByRole('cell', { name: '01/02/2020' }));
      assert.ok(screen.getByRole('cell', { name: '10' }));
      assert.ok(screen.getByRole('cell', { name: t('pages.profiles-list.table.column.certifiable-tag') }));
      assert.ok(screen.getByRole('cell', { name: '5' }));
    });

    test('it should display a link to access participant profile', async function (assert) {
      // given
      this.owner.setupRouter();
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        code: 'AAAAAA111',
        participationsCount: 1,
      });
      const profiles = [
        {
          id: 7,
          lastName: 'Todori',
          firstName: 'Shoto',
        },
      ];

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByRole('link', { href: '/campagnes/1/profils/7' }));
    });
  });

  module('when there is no profile', function () {
    test('it should display no profil when hasParticipations filtered', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
      });
      const profiles = [];
      profiles.meta = { rowCount: 0 };

      // when
      const screen = await render(
        <template>
          <ProfileList
            @campaign={{campaign}}
            @profiles={{profiles}}
            @onClickParticipant={{noop}}
            @onFilter={{noop}}
            @selectedDivisions={{divisions}}
            @selectedGroups={{groups}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText('En attente de profils'));
    });
  });
});
