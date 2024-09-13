import { render } from '@1024pix/ember-testing-library';
import { findAll } from '@ember/test-helpers';
import ModuleElementText from 'mon-pix/components/module/element/text';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Text', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a Text', async function (assert) {
    // given
    const textElement = { content: 'toto', type: 'text' };

    //  when
    const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-text').length, 1);
    assert.ok(screen.getByText('toto'));
  });
});
