import { render } from '@1024pix/ember-testing-library';
import PlacesLotsAlert from 'pix-orga/components/places/places-lot-alert';
import { STATUSES } from 'pix-orga/models/organization-places-lot';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import setupIntlRenderingTest from 'pix-orga/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Places | PlacesLotsAlert', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store, clock;
  const now = new Date('2021-11-03');

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    clock = sinon.useFakeTimers({ now });
  });

  hooks.afterEach(function () {
    clock.restore();
  });

  test('it should show an alert with remaining days before places lot expires', async function (assert) {
    // given
    const placesLots = [
      store.createRecord('organization-places-lot', {
        count: 123,
        activationDate: new Date('2021-11-01'),
        expirationDate: new Date('2021-11-30'),
        status: STATUSES.ACTIVE,
      }),
    ];
    // when
    const screen = await render(<template><PlacesLotsAlert @placesLots={{placesLots}} /></template>);
    const banner = screen.getByText(t('banners.last-places-lot-available.message', { days: 27 }));

    // then
    const alert = screen.queryByRole('paragraph');
    assert.dom(alert).exists();
    assert.strictEqual(banner.outerText, t('banners.last-places-lot-available.message', { days: 27 }));
  });

  test('it should not show an alert if there is one active lot that has an expiration date in more than 1 month', async function (assert) {
    // given
    const placesLots = [
      store.createRecord('organization-places-lot', {
        count: 123,
        activationDate: new Date('2021-11-01'),
        expirationDate: new Date('2021-11-07'),
        status: STATUSES.ACTIVE,
      }),
      store.createRecord('organization-places-lot', {
        count: 123,
        activationDate: new Date('2021-11-01'),
        expirationDate: new Date('2021-12-03'),
        status: STATUSES.ACTIVE,
      }),
    ];

    // when
    const screen = await render(<template><PlacesLotsAlert @placesLots={{placesLots}} /></template>);

    // then
    const alert = screen.queryByRole('paragraph');
    assert.dom(alert).doesNotExist();
  });

  test('it should not show an alert if remaining days before places lot expires in more than 30 days', async function (assert) {
    // given
    const placesLots = [
      store.createRecord('organization-places-lot', {
        count: 123,
        activationDate: new Date('2021-11-01'),
        expirationDate: new Date('2021-12-03'),
        status: STATUSES.ACTIVE,
      }),
    ];
    // when
    const screen = await render(<template><PlacesLotsAlert @placesLots={{placesLots}} /></template>);

    // then
    const alert = screen.queryByRole('paragraph');
    assert.dom(alert).doesNotExist();
  });

  test('it should not show alert if there is `PENDING` placesLots', async function (assert) {
    // given
    const placesLots = [
      store.createRecord('organization-places-lot', {
        count: 123,
        activationDate: new Date('2021-11-01'),
        expirationDate: new Date('2021-11-30'),
        status: STATUSES.ACTIVE,
      }),
      store.createRecord('organization-places-lot', {
        count: 123,
        activationDate: new Date('2021-12-01'),
        expirationDate: new Date('2021-12-30'),
        status: STATUSES.PENDING,
      }),
    ];
    // when
    const screen = await render(<template><PlacesLotsAlert @placesLots={{placesLots}} /></template>);

    // then
    const alert = screen.queryByRole('paragraph');
    assert.dom(alert).doesNotExist();
  });

  test('it should not show alert if there is no ACTIVE placesLots', async function (assert) {
    // given
    const placesLots = [
      store.createRecord('organization-places-lot', {
        count: 123,
        activationDate: new Date('2020-12-01'),
        expirationDate: new Date('2020-12-30'),
        status: STATUSES.EXPIRED,
      }),
    ];
    // when
    const screen = await render(<template><PlacesLotsAlert @placesLots={{placesLots}} /></template>);

    // then
    const alert = screen.queryByRole('paragraph');
    assert.dom(alert).doesNotExist();
  });

  test('it should not show alert if there is no placesLots', async function (assert) {
    // given
    const placesLots = [];
    // when
    const screen = await render(<template><PlacesLotsAlert @placesLots={{placesLots}} /></template>);

    // then
    const alert = screen.queryByRole('paragraph');
    assert.dom(alert).doesNotExist();
  });
});
