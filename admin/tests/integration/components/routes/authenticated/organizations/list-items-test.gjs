import { render, within } from '@1024pix/ember-testing-library';
import ListItems from 'pix-admin/components/organizations/list-items';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/authenticated/organizations | list-items', function (hooks) {
  setupIntlRenderingTest(hooks);
  const administrationTeams = [
    { id: 1, name: 'Team A' },
    { id: 2, name: 'Team B' },
    { id: 3, name: 'Team C' },
  ];

  hooks.beforeEach(async function () {
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };
  });

  const triggerFiltering = function () {};
  const resetFilter = function () {};

  test('it should display header with id, name, type, team and externalId', async function (assert) {
    // given
    const externalId = '1234567A';
    const organizations = [
      { id: 1, name: 'École ACME', type: 'SCO', externalId },
      { id: 2, name: 'Université BROS', type: 'SUP', externalId },
      { id: 3, name: 'Entreprise KSSOS', type: 'PRO', externalId },
    ];

    organizations.administrationTeams = administrationTeams;

    organizations.meta = {
      rowCount: 3,
    };

    // when
    const screen = await render(
      <template>
        <ListItems
          @organizations={{organizations}}
          @administrationTeams={{administrationTeams}}
          @triggerFiltering={{triggerFiltering}}
          @onResetFilter={{resetFilter}}
        />
      </template>,
    );

    // then
    const table = screen.getByRole('table', { name: t('components.organizations.list-items.table.caption') });
    assert.dom(within(table).getByRole('columnheader', { name: 'ID' })).exists();
    assert.dom(within(table).getByRole('columnheader', { name: 'Nom' })).exists();
    assert.dom(within(table).getByRole('columnheader', { name: 'Type' })).exists();
    assert
      .dom(
        within(table).getByRole('columnheader', {
          name: t('components.organizations.list-items.table.header.administration-team-name'),
        }),
      )
      .exists();
    assert.dom(within(table).getByRole('columnheader', { name: 'Identifiant externe' })).exists();
  });

  test('if should display search inputs', async function (assert) {
    // given

    // when
    const screen = await render(
      <template>
        <ListItems
          @administrationTeams={{administrationTeams}}
          @triggerFiltering={{triggerFiltering}}
          @onResetFilter={{resetFilter}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('spinbutton', { name: 'Identifiant' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Nom' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Type' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Identifiant externe' })).exists();
  });

  test('it should display organization list', async function (assert) {
    // given
    const externalId = '1234567A';
    const organizations = [
      { id: 1, name: 'École ACME', type: 'SCO', externalId: '1234567A', administrationTeamName: 'Team A' },
      { id: 2, name: 'Université BROS', type: 'SUP', externalId: '1234567B', administrationTeamName: 'Team B' },
      { id: 3, name: 'Entreprise KSSOS', type: 'PRO', externalId: '1234567C', administrationTeamName: 'Team C' },
    ];

    organizations.meta = {
      rowCount: 3,
    };

    // when
    const screen = await render(
      <template>
        <ListItems
          @organizations={{organizations}}
          @administrationTeams={{administrationTeams}}
          @triggerFiltering={{triggerFiltering}}
          @onResetFilter={{resetFilter}}
        />
      </template>,
    );

    // then
    const table = screen.getByRole('table', { name: t('components.organizations.list-items.table.caption') });
    const rows = within(table).getAllByRole('row');
    assert.dom(within(table).getByRole('cell', { name: '1' })).exists();
    assert.dom(within(table).getByRole('cell', { name: 'École ACME' })).exists();
    assert.dom(within(table).getByRole('cell', { name: 'SCO' })).exists();
    assert.dom(within(table).getByRole('cell', { name: 'Team A' })).exists();
    assert.dom(within(table).getByRole('cell', { name: externalId })).exists();
    assert.strictEqual(rows.length, 4);
  });
});
