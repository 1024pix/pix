import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { contains } from '../../helpers/contains';

module('Unit | Helpers | contains', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('contains', function () {
    test('should contains Hello', async function (assert) {
      await render(hbs`<div>Hello</div>`);
      assert.dom(contains('Hello')).exists();
    });

    test('should not find any element', async function (assert) {
      await render(hbs`<div>Goodbye</div>`);
      assert.equal(contains('Hello'), null);
    });

    test('should find only one element', async function (assert) {
      await render(hbs`<div><span id="first">Hello</span><span>Hello</span></div>`);
      assert.equal(contains('Hello').tagName, 'DIV');
    });

    test('should not find any element deeply', async function (assert) {
      await render(hbs`<div><span>Goodbye</span></div>`);
      assert.equal(contains('Hello'), null);
    });
  });
});
