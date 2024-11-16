import { render, within } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Results::ProfileList', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    this.set('noop', sinon.stub());
    this.set('divisions', []);
    this.set('groups', []);
  });

  module('table informations', function () {
    test('it should display table caption', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
      });
      this.profiles = [];
      this.profiles.meta = { rowCount: 0 };

      // when
      const screen = await render(
        hbs`<Campaign::Results::ProfileList
  @campaign={{this.campaign}}
  @profiles={{this.profiles}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
/>`,
      );

      // then
      assert.ok(screen.getByRole('table', { name: t('pages.profiles-list.table.caption') }));
    });
  });
  module('table headers for multiple sendings campaign', function () {
    test('it should display evolution header and tooltip and shared profile count when campaign is multiple sendings', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
        multipleSendings: true,
      });
      this.profiles = [];
      this.profiles.meta = { rowCount: 0 };

      // when
      const screen = await render(
        hbs`<Campaign::Results::ProfileList
  @campaign={{this.campaign}}
  @profiles={{this.profiles}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
/>`,
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
      this.campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
        multipleSendings: false,
      });
      this.profiles = [];
      this.profiles.meta = { rowCount: 0 };

      // when
      const screen = await render(
        hbs`<Campaign::Results::ProfileList
  @campaign={{this.campaign}}
  @profiles={{this.profiles}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
/>`,
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
      this.campaign = store.createRecord('campaign', {
        id: '1',
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
          firstName: 'Patrick',
          lastName: 'Doe2',
          participantExternalId: '1234',
          sharedAt: null,
        },
      ];
      this.profiles.meta = { rowCount: 2 };

      // when
      const screen = await render(
        hbs`<Campaign::Results::ProfileList
  @campaign={{this.campaign}}
  @profiles={{this.profiles}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
/>`,
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

    test('it should display correct evolution', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 4,
        multipleSendings: true,
      });
      this.profiles = [
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
      this.profiles.meta = { rowCount: 4 };

      // when
      const screen = await render(
        hbs`<Campaign::Results::ProfileList
  @campaign={{this.campaign}}
  @profiles={{this.profiles}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
/>`,
      );

      // then
      assert.ok(screen.getByRole('cell', { name: t('pages.profiles-list.table.evolution.increase') }));
      assert.ok(screen.getByRole('cell', { name: t('pages.profiles-list.table.evolution.decrease') }));
      assert.ok(screen.getByRole('cell', { name: t('pages.profiles-list.table.evolution.stable') }));
      assert.ok(screen.getByRole('cell', { name: t('pages.profiles-list.table.evolution.unavailable') }));
    });

    test('it should display number of profiles shares', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
        multipleSendings: true,
      });
      this.profiles = [
        {
          firstName: 'John',
          lastName: 'Doe',
          participantExternalId: '123',
          sharedProfileCount: 3,
          evolution: 'decrease',
          sharedAt: new Date(2020, 1, 1),
        },
      ];
      this.profiles.meta = { rowCount: 1 };

      // when
      const screen = await render(
        hbs`<Campaign::Results::ProfileList
  @campaign={{this.campaign}}
  @profiles={{this.profiles}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
/>`,
      );

      // then
      assert.ok(screen.getByRole('cell', { name: '3' }));
    });

    test('it should display the profile list with external id', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        idPixLabel: 'identifiant externe',
        participationsCount: 1,
      });
      this.profiles = [{ participantExternalId: '123' }];
      this.profiles.meta = { rowCount: 1 };

      // when
      const screen = await render(
        hbs`<Campaign::Results::ProfileList
  @campaign={{this.campaign}}
  @profiles={{this.profiles}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
/>`,
      );

      // then
      assert.ok(screen.getByRole('columnheader', { name: 'identifiant externe' }));
      assert.ok(screen.getByRole('cell', { name: '123' }));
    });

    test('it should display participant certification profile info when shared', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: '1',
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

      // when
      const screen = await render(
        hbs`<Campaign::Results::ProfileList
  @campaign={{this.campaign}}
  @profiles={{this.profiles}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
/>`,
      );

      // then
      assert.ok(screen.getByRole('cell', { name: '01/02/2020' }));
      assert.ok(screen.getByRole('cell', { name: '10' }));
      assert.ok(screen.getByRole('cell', { name: 'Certifiable' }));
      assert.ok(screen.getByRole('cell', { name: '5' }));
    });

    test('it should display a link to access participant profile', async function (assert) {
      // given
      this.owner.setupRouter();
      this.campaign = store.createRecord('campaign', {
        id: '1',
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

      // when
      const screen = await render(
        hbs`<Campaign::Results::ProfileList
  @campaign={{this.campaign}}
  @profiles={{this.profiles}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
/>`,
      );

      // then
      assert.ok(screen.getByRole('link', { href: '/campagnes/1/profils/7' }));
    });
  });

  module('when there is no profile', function () {
    test('it should display no profil when hasParticipations filtered', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        participationsCount: 1,
      });
      this.profiles = [];
      this.profiles.meta = { rowCount: 0 };

      // when
      const screen = await render(
        hbs`<Campaign::Results::ProfileList
  @campaign={{this.campaign}}
  @profiles={{this.profiles}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
/>`,
      );

      // then
      assert.ok(screen.getByText('En attente de profils'));
    });
  });
});
