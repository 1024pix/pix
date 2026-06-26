import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import TimedChallengeInstructions from 'mon-pix/components/timed-challenge-instructions';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | timed-challenge-instructions', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('allocated time rendering', function () {
    [
      { input: '', expected: '' },
      { input: ' ', expected: '' },
      { input: 'undefined', expected: '' },
      { input: null, expected: '' },
      { input: 0, expected: '' },
      { input: 1, expected: '1 seconde' },
      { input: 10, expected: '10 secondes' },
      { input: 60, expected: '1 minute' },
      { input: 61, expected: '1 minute et 1 seconde' },
      { input: 70, expected: '1 minute et 10 secondes' },
      { input: 120, expected: '2 minutes' },
      { input: 121, expected: '2 minutes et 1 seconde' },
      { input: 122, expected: '2 minutes et 2 secondes' },
      { input: 130, expected: '2 minutes et 10 secondes' },
    ].forEach((data) => {
      test(`should display "${data.expected}" when passing ${data.input}`, async function (assert) {
        // given

        // when
        const screen = await render(<template><TimedChallengeInstructions @time={{data.input}} /></template>);

        // then
        const time = !Number.isInteger(data.input)
          ? ''
          : new Intl.DurationFormat('fr', { style: 'long' }).format({
              minutes: Math.floor(data.input / 60),
              seconds: data.input % 60,
            });

        const headingName = t('pages.timed-challenge-instructions.primary', { time, htmlSfe: true });
        assert
          .dom(
            screen.getByRole('heading', {
              name: headingName.replaceAll(/<\/?[\w\s]*>|<.+[\W]>/g, '').replaceAll('  ', ' '),
            }),
          )
          .exists();
      });
    });
  });
});
