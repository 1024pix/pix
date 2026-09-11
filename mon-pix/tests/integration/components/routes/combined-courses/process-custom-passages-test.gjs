import { render, waitFor } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CombinedCoursesProcessCustomPassages from 'mon-pix/components/routes/combined-courses/process-custom-passages';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering.js';
module('Integration | Component | Combined Courses | Process custom passages', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders process custom passages component', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CombinedCoursesProcessCustomPassages
          @lineAppearanceInterval={{0}}
          @lineTransitionDuration={{0}}
          @iconTransitionDuration={{0}}
          @code="PROASNULL"
        />
      </template>,
    );

    // then
    assert.ok(screen.getByRole('heading', { name: t('pages.combined-courses.process-custom-passages.title') }));
    assert.ok(screen.getByText(t('pages.combined-courses.process-custom-passages.description')));
    assert.ok(screen.getByText(t('pages.combined-courses.process-custom-passages.list.results-analysis')));
    assert.ok(screen.getByText(t('pages.combined-courses.process-custom-passages.list.select-passages')));
    assert.ok(screen.getByText(t('pages.combined-courses.process-custom-passages.list.generate-personalize-course')));
  });

  test('redirects to combined course presentation page on click on continue', async function (assert) {
    // given
    const routerService = this.owner.lookup('service:router');
    sinon.stub(routerService, 'transitionTo');

    const screen = await render(
      <template>
        <CombinedCoursesProcessCustomPassages
          @lineAppearanceInterval={{0}}
          @lineTransitionDuration={{0}}
          @iconTransitionDuration={{0}}
          @code="MyCode"
        />
      </template>,
    );

    await waitFor(async () => {
      // when
      await click(screen.getByRole('button', { name: t('common.actions.continue') }));

      // then
      sinon.assert.calledWithExactly(routerService.transitionTo, 'combined-courses.programme', 'MyCode');
      assert.ok(true);
    });
  });
});
