import { render } from '@1024pix/ember-testing-library';
import GrainSummary from 'mon-pix/components/module/grain/summary';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Grain | Summary', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the illustration', async function (assert) {
    // given
    const grain = { id: 'summary-grain-id', type: 'summary', components: [] };

    // when
    const screen = await render(<template><GrainSummary @grain={{grain}} /></template>);

    // then
    assert.strictEqual(screen.getByRole('presentation').getAttribute('src'), '/images/modulix/megaphone.png');
  });

  test('should display the grain content', async function (assert) {
    // given
    const textElement = {
      id: 'text-element-id',
      content: 'Contenu du récap',
      type: 'text',
      isAnswerable: false,
      tag: ' ',
    };
    const grain = {
      id: 'summary-grain-id',
      type: 'summary',
      components: [{ type: 'element', element: textElement }],
    };

    // when
    const screen = await render(<template><GrainSummary @grain={{grain}} /></template>);

    // then
    assert.ok(screen.getByText('Contenu du récap'));
  });
});
