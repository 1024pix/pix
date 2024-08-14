import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import LanguageSwitcher from 'pix-certif/components/language-switcher';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Language Switcher', function (hooks) {
  setupIntlRenderingTest(hooks);

  let localeService;

  let availableLanguages = {
    en: {
      value: 'English',
      languageSwitcherDisplayed: true,
    },
    fr: {
      value: 'Français',
      languageSwitcherDisplayed: true,
    },
    el: {
      value: 'Primitive Eldarìn',
      languageSwitcherDisplayed: true,
    },
    si: {
      value: 'Sindarìn',
      languageSwitcherDisplayed: true,
    },
  };

  hooks.beforeEach(function () {
    localeService = this.owner.lookup('service:locale');
  });

  module('when component renders', function () {
    test('displays a button with default option selected', async function (assert) {
      // given
      sinon.stub(localeService, 'getAvailableLanguages').returns(availableLanguages);

      // when
      const screen = await render(<template><LanguageSwitcher @selectedLanguage='en' /></template>);

      // then
      const selectALanguage = t('common.forms.login.choose-language-aria-label');

      assert.dom(screen.getByRole('button', { name: selectALanguage })).includesText('English');
    });
  });

  module('when component is clicked', function () {
    test('displays a sorted list of available languages with french language first', async function (assert) {
      // given
      sinon.stub(localeService, 'getAvailableLanguages').returns(availableLanguages);

      // when
      const screen = await render(<template><LanguageSwitcher @selectedLanguage='en' /></template>);

      const selectALanguage = t('common.forms.login.choose-language-aria-label');

      await click(screen.getByRole('button', { name: selectALanguage }));
      await screen.findByRole('listbox');

      // then
      const options = await screen.findAllByRole('option');
      assert.dom(screen.getByRole('option', { name: 'English' })).exists();
      const optionsInnerText = options.map((option) => {
        return option.innerText;
      });

      assert.deepEqual(optionsInnerText, ['Français', 'English', 'Primitive Eldarìn', 'Sindarìn']);
    });

    test(`displays all languages with "languageSwitcherDisplayed" attribute at true`, async function (assert) {
      // given
      availableLanguages = {
        en: {
          value: 'English',
          languageSwitcherDisplayed: true,
        },
        fr: {
          value: 'Français',
          languageSwitcherDisplayed: true,
        },
        el: {
          value: 'Primitive Eldarìn',
          languageSwitcherDisplayed: false,
        },
        si: {
          value: 'Sindarìn',
          languageSwitcherDisplayed: true,
        },
      };

      sinon.stub(localeService, 'getAvailableLanguages').returns(availableLanguages);

      const screen = await render(<template><LanguageSwitcher @selectedLanguage='en' /></template>);

      // when
      const selectALanguage = t('common.forms.login.choose-language-aria-label');

      await click(screen.getByRole('button', { name: selectALanguage }));
      await screen.findByRole('listbox');

      // then
      const options = await screen.findAllByRole('option');
      assert.dom(screen.getByRole('option', { name: 'English' })).exists();
      const optionsInnerText = options.map((option) => {
        return option.innerText;
      });

      assert.deepEqual(optionsInnerText, ['Français', 'English', 'Sindarìn']);
    });
  });

  module('when a language is selected', function () {
    test('should display correct language', async function (assert) {
      // given
      const onLanguageChangeStub = sinon.stub();
      sinon.stub(localeService, 'getAvailableLanguages').returns(availableLanguages);

      // when
      const screen = await render(
        <template><LanguageSwitcher @onLanguageChange={{onLanguageChangeStub}} @selectedLanguage='en' /></template>,
      );

      const selectALanguage = t('common.forms.login.choose-language-aria-label');

      await click(screen.getByRole('button', { name: selectALanguage }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Français' }));

      // then
      assert.ok(onLanguageChangeStub.calledWithExactly('fr'));
    });
  });
});
