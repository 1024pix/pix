import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Header from 'mon-pix/components/tutorials/header';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Tutorials | Header', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders the header', async function (assert) {
    // when
    const screen = await render(<template><Header /></template>);

    // then
    assert.ok(screen.getByRole('heading', { name: t('pages.user-tutorials.title') }));
    assert.ok(screen.getByText(t('pages.user-tutorials.description')));
    assert.ok(screen.getByRole('link', { name: t('pages.user-tutorials.recommended') }));
    assert.ok(screen.getByRole('link', { name: t('pages.user-tutorials.saved') }));
  });

  module('when shouldShowFilterButton is true', function () {
    test('should render filter button', async function (assert) {
      // when
      const screen = await render(<template><Header @shouldShowFilterButton={{true}} /></template>);

      // then
      assert.ok(screen.getByRole('button', { name: 'Filtrer' }));
    });
  });

  module('when shouldShowFilterButton is false', function () {
    test('should render filter button', async function (assert) {
      // when
      const screen = await render(<template><Header @shouldShowFilterButton={{false}} /></template>);

      // then
      assert.notOk(screen.queryByRole('button', { name: 'Filtrer' }));
    });
  });
});
