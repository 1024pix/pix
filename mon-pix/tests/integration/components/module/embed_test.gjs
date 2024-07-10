import { clickByName, render } from '@1024pix/ember-testing-library';
import ModulixEmbed from 'mon-pix/components/module/element/embed';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Embed', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display an embed', async function (assert) {
    // given
    const embed = {
      id: 'id',
      title: 'title',
      isCompletionRequired: false,
      url: 'https://embed-pix.com',
      height: 800,
    };

    // when
    const screen = await render(<template><ModulixEmbed @embed={{embed}} /></template>);

    // then
    assert.ok(screen);
    const expectedIframe = screen.getByTitle(embed.title);
    assert.strictEqual(expectedIframe.getAttribute('src'), embed.url);
    assert.strictEqual(expectedIframe.style.getPropertyValue('height'), '800px');
    assert
      .dom(screen.getByRole('button', { name: this.intl.t('pages.modulix.buttons.embed.start.ariaLabel') }))
      .exists();
  });

  module('when user clicks on start button', function () {
    test('should hide start button', async function (assert) {
      // given
      const embed = {
        id: 'id',
        title: 'title',
        isCompletionRequired: false,
        url: 'https://embed-pix.com',
        height: 800,
      };

      // when
      const screen = await render(<template><ModulixEmbed @embed={{embed}} /></template>);

      // then
      const startButtonName = this.intl.t('pages.modulix.buttons.embed.start.ariaLabel');
      await clickByName(startButtonName);
      assert.dom(screen.queryByRole('button', { name: startButtonName })).doesNotExist();
    });
  });
});
