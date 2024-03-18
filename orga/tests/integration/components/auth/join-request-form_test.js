import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Auth::JoinRequestForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when are not fill correctly', function () {
    const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'Votre prénom n’est pas renseigné.';
    const EMPTY_LASTNAME_ERROR_MESSAGE = 'Votre nom n’est pas renseigné.';

    [{ stringFilledIn: '' }, { stringFilledIn: ' ' }].forEach(function ({ stringFilledIn }) {
      test(`it should display an error message on firstName field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
        // given
        const screen = await render(hbs`<Auth::JoinRequestForm />`);

        // when
        await fillByLabel('Votre prénom', stringFilledIn);
        await triggerEvent('#firstName', 'focusout');

        // then
        assert.ok(screen.getByText(EMPTY_FIRSTNAME_ERROR_MESSAGE));
      });
    });

    [{ stringFilledIn: '' }, { stringFilledIn: ' ' }].forEach(function ({ stringFilledIn }) {
      test(`it should display an error message on lastName field, when '${stringFilledIn}' is typed and focused out`, async function (assert) {
        // given
        const screen = await render(hbs`<Auth::JoinRequestForm />`);

        // when
        await fillByLabel('Votre nom', stringFilledIn);
        await triggerEvent('#lastName', 'focusout');

        // then
        assert.ok(screen.getByText(EMPTY_LASTNAME_ERROR_MESSAGE));
      });
    });
  });
});
