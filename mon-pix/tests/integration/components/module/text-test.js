import { render } from '@1024pix/ember-testing-library';
import { findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Text', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a Text', async function (assert) {
    // given
    const textElement = { content: 'toto', type: 'text' };

    this.set('text', textElement);

    //  when
    const screen = await render(hbs`<Module::Element::Text @text={{this.text}}/>`);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-text').length, 1);
    assert.ok(screen.getByText('toto'));
  });
});
