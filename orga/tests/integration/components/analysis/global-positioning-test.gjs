import { render } from '@1024pix/ember-testing-library';
import GlobalPositioning from 'pix-orga/components/analysis/global-positioning';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Analysis | global-positioning', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('display global-positioning', function () {
    test('it should display global positioning', async function (assert) {
      // given
      const data = {
        maxReachableLevel: 4,
        meanReachedLevel: 2,
      };

      // when
      const screen = await render(<template><GlobalPositioning @data={{data}} /></template>);

      // then
      assert.ok(
        screen.getByRole('heading', {
          level: 2,
          name: t('components.global-positioning.title'),
        }),
      );
      assert.ok(screen.getByText(t('components.global-positioning.description')));
      assert.ok(
        screen.getByRole('progressbar', {
          name: t('components.global-positioning.gauge-label', { reachedLevel: 2, maxLevel: 4 }),
        }),
      );
    });
  });
});
