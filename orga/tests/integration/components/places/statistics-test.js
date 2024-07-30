import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Places::Statistics', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display occupied and available places', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('organization-place-statistic', {
      total: 30,
      occupied: 20,
      available: 10,
      anonymousSeat: 0,
    });
    // when
    const screen = await render(hbs`<Places::Statistics @model={{this.model}} />`);

    // then
    assert.ok(screen.getByText(this.model.available));
    assert.ok(screen.getAllByText(t('cards.available-seats-count.value', { total: this.model.total }))[0]);
    assert.ok(screen.getByText(this.model.occupied));
    assert.ok(screen.getAllByText(t('cards.occupied-seats-count.value', { total: this.model.total }))[1]);
    assert.notOk(screen.queryByText(t('cards.occupied-seats-count.anonymous', { count: this.model.anonymousSeat })));
  });

  test('it should display anonymous seat informations', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('organization-place-statistic', {
      total: 30,
      occupied: 20,
      available: 10,
      anonymousSeat: 1,
    });
    // when
    const screen = await render(hbs`<Places::Statistics @model={{this.model}} />`);

    // then
    assert.ok(screen.getByText(t('cards.occupied-seats-count.anonymous', { count: this.model.anonymousSeat })));
  });
});
