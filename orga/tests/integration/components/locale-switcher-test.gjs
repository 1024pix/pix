// This file is a COPY of an original file from mon-pix.
// If you need a change, as much as possible modify the original file
// and propagate the changes in the copies in all the fronts

import { render } from '@1024pix/ember-testing-library';
import { click, waitUntil } from '@ember/test-helpers';
import LocaleSwitcher from 'pix-orga/components/locale-switcher';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setCurrentLocale } from '../../helpers/setup-intl';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | LocaleSwitcher', function (hooks) {
  setupIntlRenderingTest(hooks);

  let localeService;
  let routerService;

  hooks.beforeEach(function () {
    localeService = this.owner.lookup('service:locale');
    routerService = this.owner.lookup('service:router');

    sinon.stub(localeService, 'switcherDisplayedLocales').value([
      { value: 'fr', label: 'Français' },
      { value: 'en', label: 'English' },
      { value: 'nl', label: 'Nederlands' },
    ]);
  });

  module('when component renders', function () {
    test('displays current locale', async function (assert) {
      // given
      setCurrentLocale('en');

      // when
      const screen = await render(<template><LocaleSwitcher /></template>);
      await click(screen.getByRole('button', { name: 'Select a language' }));
      await screen.findByRole('listbox');

      // then
      const selectedOption = screen.getByRole('option', { name: 'English' });
      assert.dom(selectedOption).hasAttribute('aria-selected', 'true');
    });
  });

  module('when component is clicked', function () {
    test('displays a list of available locales with french locale first', async function (assert) {
      // given
      setCurrentLocale('fr');
      const screen = await render(<template><LocaleSwitcher /></template>);

      // when
      await click(screen.getByRole('button', { name: 'Sélectionnez une langue' }));
      await screen.findByRole('listbox');

      // then
      const options = await screen.findAllByRole('option');
      const optionsInnerText = options.map((option) => option.innerText);

      assert.deepEqual(optionsInnerText, ['Français', 'English', 'Nederlands']);
    });
  });

  module('when a locale is selected', function () {
    test('calls onChange callback', async function (assert) {
      // given
      const onLocaleChangeStub = sinon.stub();
      sinon.stub(localeService, 'setCurrentLocale');
      sinon.stub(routerService, 'replaceWith');
      setCurrentLocale('fr');

      const screen = await render(<template><LocaleSwitcher @onChange={{onLocaleChangeStub}} /></template>);

      // when
      await click(screen.getByRole('button', { name: 'Sélectionnez une langue' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'English' }));
      await waitUntil(() => onLocaleChangeStub.called);

      // then
      assert.ok(onLocaleChangeStub.calledWithExactly('en'));
      assert.ok(localeService.setCurrentLocale.calledWith('en'));
      assert.ok(routerService.replaceWith.calledWith({ queryParams: { lang: null } }));
    });
  });
});
