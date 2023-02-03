import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Ui::CertificabilityTooltip', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display the certificability tooltip', async function (assert) {
    // given
    this.label = 'Description';
    this.content = 'Amazing content';

    // when
    await render(hbs`<Ui::CertificabilityTooltip @aria-label={{this.label}} @content={{this.content}} />`);

    // then
    assert.contains('Amazing content');
  });
});
