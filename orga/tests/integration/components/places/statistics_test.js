import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Places::Statistics', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display occupied and available places', async function (assert) {
    // given
    this.total = 30;
    this.occupied = 20;
    this.available = 10;
    // when
    const screen = await render(
      hbs`<Places::Statistics @total={{this.total}} @occupied={{this.occupied}} @available={{this.available}} />`,
    );

    // then
    assert.ok(screen.getByText(this.available));
    assert.ok(screen.getAllByText(this.intl.t('cards.available-seats-count.value', { total: this.total }))[0]);
    assert.ok(screen.getByText(this.occupied));
    assert.ok(screen.getAllByText(this.intl.t('cards.occupied-seats-count.value', { total: this.total }))[1]);
  });
});
