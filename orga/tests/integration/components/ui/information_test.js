import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Ui | Information', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('label', function () {
    test('it the title and the content givent', async function (assert) {
      this.set('title', 'Title');
      this.set('content', 'Content');

      await render(hbs`<Ui::Information>
  <:title>{{this.title}}</:title>
  <:content>{{this.content}}</:content>
</Ui::Information>`);

      assert.contains(this.title);
      assert.contains(this.content);
    });
  });
});
