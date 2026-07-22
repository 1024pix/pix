import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ThankYou from 'mon-pix/components/campaigns/assessment/results-recommendation-engine/drawer/thank-you';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | ResultsRecommendationEngine | Drawer | ThankYou',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('it displays the thank you title and subtitle', async function (assert) {
      // given
      const noop = sinon.stub();

      // when
      const screen = await render(<template><ThankYou @onClose={{noop}} /></template>);

      // then
      assert.dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.thank-you.title'))).isVisible();
      assert.dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.thank-you.subtitle'))).isVisible();
    });

    test('it displays a close button', async function (assert) {
      // given
      const noop = sinon.stub();

      // when
      const screen = await render(<template><ThankYou @onClose={{noop}} /></template>);

      // then
      assert
        .dom(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.hide-aria-label') }))
        .isVisible();
    });

    module('when user clicks the close button', function () {
      test('it calls onClose', async function (assert) {
        // given
        const onCloseStub = sinon.stub();
        const screen = await render(<template><ThankYou @onClose={{onCloseStub}} /></template>);

        // when
        await click(
          screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.hide-aria-label') }),
        );

        // then
        sinon.assert.calledOnce(onCloseStub);
        assert.ok(true);
      });
    });
  },
);
