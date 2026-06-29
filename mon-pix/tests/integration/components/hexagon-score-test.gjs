import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import HexagonScore from 'mon-pix/components/hexagon-score';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | hexagon-score', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    test('should display two dashes, when no pixScore provided', async function (assert) {
      // given
      const maxReachablePixScore = 100;
      const maxReachableLevel = 5;

      // when
      const screen = await render(
        <template>
          <HexagonScore @maxReachablePixScore={{maxReachablePixScore}} @maxReachableLevel={{maxReachableLevel}} />
        </template>,
      );

      // then
      assert.ok(screen.getByText('–'));
    });

    test('should display provided score in hexagon', async function (assert) {
      // given
      const pixScore = '777';

      // when
      const screen = await render(<template><HexagonScore @pixScore={{pixScore}} /></template>);

      // then
      assert.ok(screen.getByText(pixScore));
    });

    test('should display an information tooltip', async function (assert) {
      // given
      const maxReachablePixScore = 100;
      const maxReachableLevel = 5;

      // when
      const screen = await render(
        <template>
          <HexagonScore @maxReachablePixScore={{maxReachablePixScore}} @maxReachableLevel={{maxReachableLevel}} />
        </template>,
      );

      // then
      assert.ok(screen.getByRole('button', { name: t('pages.profile.total-score-helper.label') }));
    });
  });
});
