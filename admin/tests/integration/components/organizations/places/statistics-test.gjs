import { render } from '@1024pix/ember-testing-library';
import Statistics from 'pix-admin/components/organizations/places/statistics';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Places::Statistics', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display occupied and available places', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('organization-places-statistic', {
      total: 30,
      occupied: 20,
      available: 10,
      anonymousSeat: 0,
    });

    // when
    const screen = await render(<template><Statistics @statistics={{model}} /></template>);

    // then
    assert.ok(screen.getByText(model.available));
    assert.ok(
      screen.getAllByText(
        t('components.organizations.places.statistics.available-seats-count.value', { total: model.total }),
      )[0],
    );
    assert.ok(screen.getByText(model.occupied));
    assert.ok(
      screen.getAllByText(
        t('components.organizations.places.statistics.occupied-seats-count.value', { total: model.total }),
      )[1],
    );
    assert.notOk(
      screen.queryByText(
        t('components.organizations.places.statistics.occupied-seats-count.anonymous', { count: model.anonymousSeat }),
      ),
    );
  });

  test('it should display anonymous seat informations', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('organization-places-statistic', {
      total: 30,
      occupied: 20,
      available: 10,
      anonymousSeat: 1,
    });
    // when
    const screen = await render(<template><Statistics @statistics={{model}} /></template>);

    // then
    assert.ok(
      screen.getByText(
        t('components.organizations.places.statistics.occupied-seats-count.anonymous', { count: model.anonymousSeat }),
      ),
    );
  });
});
