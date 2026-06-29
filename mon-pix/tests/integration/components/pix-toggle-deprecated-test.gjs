import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import PixToggleDeprecated from 'mon-pix/components/pix-toggle-deprecated';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | pix-toggle-deprecated', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(async function () {
    const valueFirstLabel = 'valueFirstLabel';
    const valueSecondLabel = 'valueSecondLabel';
    const onToggle = function () {};

    await render(
      <template>
        <PixToggleDeprecated
          @onToggle={{onToggle}}
          @valueFirstLabel={{valueFirstLabel}}
          @valueSecondLabel={{valueSecondLabel}}
        />
      </template>,
    );
  });

  test('Default Render', function (assert) {
    assert.dom('.pix-toggle-deprecated').exists();
  });

  test('should display the toggle with on/off span', function (assert) {
    assert.dom('.pix-toggle-deprecated__on').exists();
    assert.dom('.pix-toggle-deprecated__off').exists();
  });

  test('should display the toggle with on/off span with the correct values', function (assert) {
    assert.strictEqual(find('.pix-toggle-deprecated__on').nodeName, 'SPAN');
    assert.strictEqual(find('.pix-toggle-deprecated__off').nodeName, 'SPAN');
    assert.strictEqual(find('.pix-toggle-deprecated__on').textContent, 'valueFirstLabel');
    assert.strictEqual(find('.pix-toggle-deprecated__off').textContent, 'valueSecondLabel');
  });

  test('should change the value of toggleOn when toggle off', async function (assert) {
    await click('.pix-toggle-deprecated__off');

    assert.strictEqual(find('.pix-toggle-deprecated__on').textContent, 'valueSecondLabel');
    assert.strictEqual(find('.pix-toggle-deprecated__off').textContent, 'valueFirstLabel');

    await click('.pix-toggle-deprecated__off');

    assert.strictEqual(find('.pix-toggle-deprecated__on').textContent, 'valueFirstLabel');
    assert.strictEqual(find('.pix-toggle-deprecated__off').textContent, 'valueSecondLabel');
  });
});
