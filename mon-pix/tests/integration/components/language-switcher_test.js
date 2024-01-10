import { module, test } from 'qunit';
import sinon from 'sinon';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { click } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Language Switcher', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when component renders', function () {
    test('displays a button with default option selected', async function (assert) {
      // when
      const screen = await render(hbs`<LanguageSwitcher @selectedLanguage="en" />`);

      // then
      assert.dom(screen.getByRole('button', { name: 'English' })).exists();
    });
  });

  module('when component is clicked', function () {
    test('displays a list of available languages with french language first', async function (assert) {
      // given
      const screen = await render(hbs`<LanguageSwitcher @selectedLanguage="en" />`);

      // when
      await click(screen.getByRole('button', { name: 'English' }));
      await screen.findByRole('listbox');

      // then
      const options = await screen.findAllByRole('option');
      const optionsInnerText = options.map((option) => {
        return option.innerText;
      });

      assert.deepEqual(optionsInnerText, ['Français', 'English']);
    });
  });

  module('when a language is selected', function () {
    test('calls onLanguageChange callback', async function (assert) {
      // given
      const onLanguageChangeStub = sinon.stub();
      this.set('onLanguageChange', onLanguageChangeStub);
      const screen = await render(hbs`<LanguageSwitcher
        @onLanguageChange={{this.onLanguageChange}}
        @selectedLanguage="en"
      />`);

      // when
      await click(screen.getByRole('button', { name: 'English' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Français' }));

      // then
      assert.dom(screen.getByRole('button', { name: 'Français' })).exists();
      assert.ok(onLanguageChangeStub.called);
    });
  });
});
