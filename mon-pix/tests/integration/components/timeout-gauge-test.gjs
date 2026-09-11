import { render } from '@1024pix/ember-testing-library';
import TimeoutGauge from 'mon-pix/components/timeout-gauge';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | TimeoutGauge', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    [
      { allottedTime: 0, expected: '0:00', label: '0 secondes' },
      { allottedTime: 60, expected: '1:00', label: '1 minute 0 secondes' },
      { allottedTime: 90, expected: '1:30', label: '1 minute 30 secondes' },
      { allottedTime: 120, expected: '2:00', label: '2 minutes 0 secondes' },
    ].forEach(({ allottedTime, expected, label }) => {
      test(`renders "${expected}" as remaining time when allotted time is ${allottedTime}s`, async function (assert) {
        // given
        const allottedTimeValue = allottedTime;

        // when
        const screen = await render(<template><TimeoutGauge @allottedTime={{allottedTimeValue}} /></template>);

        // then
        assert.dom(screen.getByText(expected)).exists();
        assert.dom(screen.getByLabelText(label)).exists();
      });
    });
  });
});
