import { render } from '@1024pix/ember-testing-library';
import ImportReplaceSup from 'pix-orga/components/import/replace-sup';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Import::ReplaceSup', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('upload button', function () {
    test('should be disable', async function (assert) {
      // given
      const supportedFormats = ['.csv'];
      // when
      const screen = await render(
        <template><ImportReplaceSup @disabled={{true}} @supportedFormats={{supportedFormats}} /></template>,
      );

      // then
      const button = screen.getByRole('button', {
        name: t('pages.organization-participants-import.actions.replace.label'),
      });
      assert.ok(button.hasAttribute('aria-disabled'));
    });

    test('should be enable', async function (assert) {
      // given
      const supportedFormats = ['.csv'];

      // when
      const screen = await render(
        <template><ImportReplaceSup @disabled={{false}} @supportedFormats={{supportedFormats}} /></template>,
      );

      // then
      const button = screen.getByRole('button', {
        name: t('pages.organization-participants-import.actions.replace.label'),
      });
      assert.notOk(button.hasAttribute('aria-disabled'));
    });
  });
});
