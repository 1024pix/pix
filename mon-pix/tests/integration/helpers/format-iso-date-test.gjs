import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import formatISOdate from 'mon-pix/helpers/format-iso-date';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Integration | Helpers | FormatISOdate', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'fr');

  test('displays formatted date when date is an ISO valid date', async function (assert) {
    const date = '2026-12-25';

    const screen = await render(
      <template>
        {{! template-lint-disable "no-bare-strings" }}
        Né le :
        {{formatISOdate date format="L"}}
      </template>,
    );

    assert.dom(screen.getByText('Né le : 25/12/2026')).exists();
  });

  test('displays formatted date using given format when date is an ISO valid date', async function (assert) {
    const date = '2026-12-25';

    const screen = await render(
      <template>
        {{! template-lint-disable "no-bare-strings" }}Né le :
        {{formatISOdate date format="LL"}}
      </template>,
    );

    assert.dom(screen.getByText('Né le : 25 décembre 2026')).exists();
  });

  test('displays empty string when date is not an ISO valid date', async function (assert) {
    const date = '1/2/2026';

    const screen = await render(
      <template>
        {{! template-lint-disable "no-bare-strings" }}Né le :
        {{formatISOdate date format="L"}}
      </template>,
    );
    assert.dom(screen.getByText('Né le :')).exists();
  });
});
