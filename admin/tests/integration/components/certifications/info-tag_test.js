import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certifications/info-tag', function (hooks) {
  setupRenderingTest(hooks);

  module('when certification is published', function () {
    test('it renders', async function (assert) {
      // given
      this.set('certification', { isPublished: true });

      // when
      const screen = await render(hbs`<Certifications::InfoTag @record={{this.certification}} />`);

      // then
      assert.dom(screen.getByText('Publiée')).exists();
    });
  });

  module('when certification is not published', function () {
    test('it renders', async function (assert) {
      // given
      this.set('certification', { isPublished: true });

      // when
      const screen = await render(hbs`<Certifications::InfoTag @record={{this.certification}} />`);

      // then
      assert.dom(screen.queryByText('Publiée')).doesNotExist();
    });
  });

  module('when certification is cancelled', function () {
    test('it renders', async function (assert) {
      // given
      this.set('certification', { isCancelled: true });

      // when
      const screen = await render(hbs`<Certifications::InfoTag @record={{this.certification}} />`);

      // then
      assert.dom(screen.getByText('Annulée')).exists();
    });
  });

  module('when certification is not cancelled', function () {
    test('it renders', async function (assert) {
      // given
      this.set('certification', { isCancelled: false });

      // when
      const screen = await render(hbs`<Certifications::InfoTag @record={{this.certification}} />`);

      // then
      assert.dom(screen.queryByText('Annulée')).doesNotExist();
    });
  });
});
