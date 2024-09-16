import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import PlacesLotTable from 'pix-orga/components/places/places-lot-table';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Places | PlacesLotTable', function (hooks) {
  setupIntlRenderingTest(hooks);
  let placesLot, store;
  const count = 123;
  const activationDate = new Date('2021-09-23');
  const expirationDate = new Date('2022-09-23');
  const status = 'PENDING';

  hooks.beforeEach(function () {
    // given
    store = this.owner.lookup('service:store');
    placesLot = store.createRecord('organization-places-lot', {
      count,
      activationDate,
      expirationDate,
      status,
    });
  });
  test('it should render a table with a title and a caption', async function (assert) {
    // when
    const placesLots = [placesLot];
    const screen = await render(<template><PlacesLotTable @placesLots={{placesLots}} /></template>);

    // then
    assert.ok(screen.getByRole('heading', t('pages.places.places-lots.table.title')));
    assert.ok(screen.getByText(t('pages.places.places-lots.table.caption')));
  });
  test('it should render a table with a correct headers', async function (assert) {
    // when
    const placesLots = [placesLot];
    const screen = await render(<template><PlacesLotTable @placesLots={{placesLots}} /></template>);

    // then
    assert.ok(screen.getByRole('columnheader', { name: t('pages.places.places-lots.table.headers.count') }));
    assert.ok(screen.getByRole('columnheader', { name: t('pages.places.places-lots.table.headers.activation-date') }));
    assert.ok(screen.getByRole('columnheader', { name: t('pages.places.places-lots.table.headers.expiration-date') }));
    assert.ok(screen.getByRole('columnheader', { name: t('pages.places.places-lots.table.headers.status') }));
  });
  test('it should render a table with a place lots infos', async function (assert) {
    // when
    const placesLots = [placesLot];
    const screen = await render(<template><PlacesLotTable @placesLots={{placesLots}} /></template>);

    // then
    assert.ok(screen.getByRole('cell', { name: placesLot.count }));
    assert.ok(screen.getByRole('cell', { name: '23/09/2021' }));
    assert.ok(screen.getByRole('cell', { name: '23/09/2022' }));
    assert.ok(screen.getByRole('cell', { name: t('pages.places.places-lots.statuses.pending') }));
  });
  test('it should render a empty cell with a dash', async function (assert) {
    // when
    const placesLots = [
      store.createRecord('organization-places-lot', {
        count: null,
        activationDate,
        expirationDate: null,
        status,
      }),
    ];
    const screen = await render(<template><PlacesLotTable @placesLots={{placesLots}} /></template>);

    // then
    assert.ok(screen.getByRole('cell', { name: '-' }));
    assert.ok(screen.getByRole('cell', { name: '23/09/2021' }));
    assert.ok(screen.getByRole('cell', { name: '-' }));
    assert.ok(screen.getByRole('cell', { name: t('pages.places.places-lots.statuses.pending') }));
  });
  test('it should render an emty state if there is no places lots', async function (assert) {
    // when
    const placesLots = [];
    const screen = await render(<template><PlacesLotTable @placesLots={{placesLots}} /></template>);

    // then
    assert.ok(screen.getByText(t('pages.places.places-lots.table.empty-state')));
  });
});
