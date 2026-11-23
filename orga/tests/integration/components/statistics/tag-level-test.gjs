import { render } from '@1024pix/ember-testing-library';
import TagLevel from 'pix-orga/components/statistics/tag-level';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Statistics | TagLevel', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#get category', function () {
    const intlKey = 'pages.statistics.level.';

    const testData = [
      { level: 0.1, expectedText: intlKey + 'novice' },
      { level: 2, expectedText: intlKey + 'novice' },
      { level: 3.4, expectedText: intlKey + 'independent' },
      { level: 4, expectedText: intlKey + 'independent' },
      { level: 4.1, expectedText: intlKey + 'independent' },
      { level: 5, expectedText: intlKey + 'advanced' },
      { level: 6, expectedText: intlKey + 'advanced' },
      { level: 6.5, expectedText: intlKey + 'advanced' },
      { level: 7, expectedText: intlKey + 'expert' },
    ];

    testData.forEach((item) => {
      test(`when level is ${item.level} it should return ${item.expectedText}`, async function (assert) {
        //given
        const level = item.level;

        //when
        const screen = await render(<template><TagLevel @level={{level}} /></template>);

        //then
        assert.ok(screen.getByText(t(item.expectedText)));
      });
    });
  });
});
