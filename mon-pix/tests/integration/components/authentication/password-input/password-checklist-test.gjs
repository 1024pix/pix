import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import PasswordChecklist from 'mon-pix/components/authentication/new-password-input/password-checklist';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const I18N = {
  RULE_1: 'common.validation.password.rules.min-length',
  RULE_2: 'common.validation.password.rules.contains-uppercase',
  RULES_STATUS_MESSAGE: 'components.authentication.new-password-input.completed-message',
};

module('Integration | Component | authentication | new-password-input | password-checklist', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when a password value is set', function () {
    module('when there is no validation error', function () {
      test('it displays rules and indicates that all rules completed', async function (assert) {
        // given
        const value = 'my-value';
        const rules = [
          { i18nKey: I18N.RULE_1, validate: () => true },
          { i18nKey: I18N.RULE_2, validate: () => true },
        ];

        // when
        const screen = await render(<template><PasswordChecklist @value={{value}} @rules={{rules}} /></template>);

        // then
        const rule1Element = screen.getByRole('listitem', { name: `${t(I18N.RULE_1)}.` });
        assert.dom(rule1Element).exists();

        const rule2Element = screen.getByRole('listitem', { name: `${t(I18N.RULE_2)}.` });
        assert.dom(rule2Element).exists();

        const rulesStatusMessage = t(I18N.RULES_STATUS_MESSAGE, { rulesCompleted: 2, rulesCount: 2 });
        assert.dom(screen.getByText(rulesStatusMessage)).exists();
      });
    });

    module('when there is a validation error', function () {
      test('it indicates number of valid rules completed', async function (assert) {
        // given
        const value = 'my-value';
        const rules = [
          { i18nKey: I18N.RULE_1, validate: () => true },
          { i18nKey: I18N.RULE_2, validate: () => false },
        ];

        // when
        const screen = await render(<template><PasswordChecklist @value={{value}} @rules={{rules}} /></template>);

        // then
        const rulesStatusMessage = t(I18N.RULES_STATUS_MESSAGE, { rulesCompleted: 1, rulesCount: 2 });
        assert.dom(screen.getByText(rulesStatusMessage)).exists();
      });
    });
  });

  module('when no password value is set', function () {
    test('it indicates no rule is completed', async function (assert) {
      // given
      const value = null;
      const rules = [
        { i18nKey: I18N.RULE_1, validate: () => true },
        { i18nKey: I18N.RULE_2, validate: () => false },
      ];

      // when
      const screen = await render(<template><PasswordChecklist @value={{value}} @rules={{rules}} /></template>);

      // then
      const rulesStatusMessage = t(I18N.RULES_STATUS_MESSAGE, { rulesCompleted: 0, rulesCount: 2 });
      assert.dom(screen.getByText(rulesStatusMessage)).exists();
    });
  });
});
