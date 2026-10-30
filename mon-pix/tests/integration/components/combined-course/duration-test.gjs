import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Duration from 'mon-pix/components/combined-course/duration';
import { CombinedCourseDurationTypes } from 'mon-pix/models/combined-course';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering.js';

module('Integration | Component | Combined Courses | Duration', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when duration is not in custom format', function () {
    test('should display the estimated duration in minutes', async function (assert) {
      // when
      const screen = await render(<template><Duration @duration={{25}} @isCustomDurationFormat={{false}} /></template>);

      // then
      assert.ok(
        screen.getByLabelText(
          t('pages.combined-courses.content.duration.aria-label-estimated-in-minutes', { duration: 25 }),
        ),
      );
      assert.ok(
        screen.getByText(t('pages.combined-courses.content.duration.estimated-duration-in-minutes', { duration: 25 })),
      );
    });

    test('should display the duration in minutes by default', async function (assert) {
      // when
      const screen = await render(<template><Duration @duration={{40}} /></template>);

      // then
      assert.ok(
        screen.getByLabelText(
          t('pages.combined-courses.content.duration.aria-label-estimated-in-minutes', { duration: 40 }),
        ),
      );
      assert.ok(
        screen.getByText(t('pages.combined-courses.content.duration.estimated-duration-in-minutes', { duration: 40 })),
      );
    });
  });

  module('when duration is in custom format', function () {
    [
      { type: CombinedCourseDurationTypes.VERY_SHORT, translationKey: 'very-short' },
      { type: CombinedCourseDurationTypes.SHORT, translationKey: 'short' },
      { type: CombinedCourseDurationTypes.MEDIUM, translationKey: 'medium' },
      { type: CombinedCourseDurationTypes.LONG, translationKey: 'long' },
      { type: CombinedCourseDurationTypes.VERY_LONG, translationKey: 'very-long' },
    ].forEach(({ type, translationKey }) => {
      test(`should display the ${type} duration option`, async function (assert) {
        // when
        const screen = await render(
          <template><Duration @duration={{type}} @isCustomDurationFormat={{true}} /></template>,
        );

        // then
        const expectedDuration = t(`pages.combined-courses.content.duration-options.${translationKey}`);
        assert.ok(screen.getByText(t(`pages.combined-courses.content.duration-options.${translationKey}`)));

        assert.ok(
          screen.getByLabelText(
            t('pages.combined-courses.content.duration.aria-label-estimated', { duration: expectedDuration }),
          ),
        );
      });
    });
  });
});
