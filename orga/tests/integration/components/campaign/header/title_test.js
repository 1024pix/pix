import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Campaign::Header::Title', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display campaign name', async function (assert) {
    // given
    this.campaign = {
      name: 'campagne 1',
      code: '1234PixTest',
      createdAt: new Date('2021-04-14'),
      ownerFullName: 'Mulan Fa',
      type: 'ASSESSMENT',
    };

    // when
    const screen = await render(hbs`<Campaign::Header::Title @campaign={{this.campaign}} />`);

    // then
    const title = screen.getByRole('heading');
    assert.true(title.textContent.includes(this.intl.t('components.campaign.type.explanation.ASSESSMENT')));
    assert.true(title.textContent.includes('campagne 1'));
    assert.ok(screen.getByText('1234PixTest'));
    assert.ok(screen.getByText('Mulan Fa'));
    assert.ok(screen.getByText('14/04/2021'));
  });
});
