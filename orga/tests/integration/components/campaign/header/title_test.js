import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaign::Header::Title', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display campaign name', async function (assert) {
    // given
    this.campaign = {
      name: 'campagne 1',
      code: '1234PixTest',
      createdAt: new Date('2021-04-14'),
      ownerFullName: 'Mulan Fa',
    };

    // when
    await render(hbs`<Campaign::Header::Title @campaign={{this.campaign}} />`);

    // then
    assert.contains('campagne 1');
    assert.contains('1234PixTest');
    assert.contains('Mulan Fa');
    assert.contains('14/04/2021');
  });
});
