import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
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
