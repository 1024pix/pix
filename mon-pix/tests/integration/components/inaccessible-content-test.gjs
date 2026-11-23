import { render } from '@1024pix/ember-testing-library';
import InaccessibleContent from 'mon-pix/components/inaccessible-content';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | inaccessible-content', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when button text is not filled', function () {
    test('renders component with title, content, instructions and button', async function (assert) {
      // when
      const screen = await render(
        <template>
          <InaccessibleContent>
            <:title>{{t "pages.combined-courses.errors.disabled.title"}}</:title>
            <:content>{{t "pages.combined-courses.errors.disabled.content"}}</:content>
            <:instructions>{{t "pages.combined-courses.errors.disabled.instructions"}}</:instructions>
          </InaccessibleContent>
        </template>,
      );

      // then
      assert.ok(screen.getByRole('heading', { name: t('pages.combined-courses.errors.disabled.title') }));
      assert.ok(screen.getByText(t('pages.combined-courses.errors.disabled.content')));
      assert.ok(screen.getByText(t('pages.combined-courses.errors.disabled.title')));
      assert.ok(screen.getByRole('link', { name: t('navigation.back-to-profile') }));
    });
  });
  module('when button text is filled', function () {
    test('renders component with title, content, instructions and button', async function (assert) {
      // when
      const screen = await render(
        <template><InaccessibleContent @buttonText="navigation.back-to-homepage" /></template>,
      );

      // then
      assert.ok(screen.getByRole('link', { name: t('navigation.back-to-homepage') }));
    });
  });
});
