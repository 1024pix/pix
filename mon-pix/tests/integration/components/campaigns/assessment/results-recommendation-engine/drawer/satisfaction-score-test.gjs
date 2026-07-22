import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import SatisfactionScore from 'mon-pix/components/campaigns/assessment/results-recommendation-engine/drawer/satisfaction-score';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | ResultsRecommendationEngine | Drawer | SatisfactionScore',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('it displays the statement and instruction', async function (assert) {
      // given
      const noop = sinon.stub();

      // when
      const screen = await render(
        <template><SatisfactionScore @onScoreSelected={{noop}} @onHide={{noop}} /></template>,
      );

      // then
      assert.dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.statement'))).isVisible();
      assert.dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.instruction'))).isVisible();
    });

    test('it displays 5 emoji buttons', async function (assert) {
      // given
      const noop = sinon.stub();

      // when
      const screen = await render(
        <template><SatisfactionScore @onScoreSelected={{noop}} @onHide={{noop}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.drawer.emojis.very-dissatisfied'),
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.emojis.dissatisfied') }),
        )
        .exists();
      assert
        .dom(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.emojis.neutral') }))
        .exists();
      assert
        .dom(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.emojis.satisfied') }))
        .exists();
      assert
        .dom(
          screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied') }),
        )
        .exists();
    });

    test('it displays a hide button', async function (assert) {
      // given
      const noop = sinon.stub();

      // when
      const screen = await render(
        <template><SatisfactionScore @onScoreSelected={{noop}} @onHide={{noop}} /></template>,
      );

      // then
      assert
        .dom(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.hide-aria-label') }))
        .isVisible();
    });

    test('it displays a tooltip for each emoji button', async function (assert) {
      // given
      const noop = sinon.stub();

      // when
      const screen = await render(
        <template><SatisfactionScore @onScoreSelected={{noop}} @onHide={{noop}} /></template>,
      );

      // then
      const tooltips = screen.getAllByRole('tooltip', { hidden: true });
      assert.strictEqual(tooltips.length, 5);
      assert.dom(tooltips[0]).hasText(t('pages.skill-review.recommended-engine.drawer.emojis.very-dissatisfied'));
      assert.dom(tooltips[1]).hasText(t('pages.skill-review.recommended-engine.drawer.emojis.dissatisfied'));
      assert.dom(tooltips[2]).hasText(t('pages.skill-review.recommended-engine.drawer.emojis.neutral'));
      assert.dom(tooltips[3]).hasText(t('pages.skill-review.recommended-engine.drawer.emojis.satisfied'));
      assert.dom(tooltips[4]).hasText(t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied'));
    });

    [
      {
        label: 'very-dissatisfied',
        length: 2,
      },
      {
        label: 'dissatisfied',
        length: 1,
      },
      {
        label: 'neutral',
        length: 1,
      },
      {
        label: 'satisfied',
        length: 1,
      },
      {
        label: 'very-satisfied',
        length: 2,
      },
    ].forEach((emoji) => {
      test('it displays labels only under the first (very-dissatisfied) and last (very-satisfied) emoji buttons', async function (assert) {
        // given
        const noop = sinon.stub();

        // when
        const screen = await render(
          <template><SatisfactionScore @onScoreSelected={{noop}} @onHide={{noop}} /></template>,
        );

        // then
        const emojiLabel = screen.getAllByText(t(`pages.skill-review.recommended-engine.drawer.emojis.${emoji.label}`));
        assert.strictEqual(emojiLabel.length, emoji.length);
      });
    });

    module('when user clicks an emoji', function () {
      test('it calls onScoreSelected with the corresponding score', async function (assert) {
        // given
        const onScoreSelectedStub = sinon.stub();
        const noop = sinon.stub();
        const screen = await render(
          <template><SatisfactionScore @onScoreSelected={{onScoreSelectedStub}} @onHide={{noop}} /></template>,
        );

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied'),
          }),
        );

        // then
        sinon.assert.calledOnceWithExactly(onScoreSelectedStub, 5);
        assert.ok(true);
      });
    });

    module('when user clicks on "hide" button', function () {
      test('it calls onHide', async function (assert) {
        // given
        const onHideStub = sinon.stub();
        const noop = sinon.stub();
        const screen = await render(
          <template><SatisfactionScore @onScoreSelected={{noop}} @onHide={{onHideStub}} /></template>,
        );

        // when
        await click(
          screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.hide-aria-label') }),
        );

        // then
        sinon.assert.calledOnce(onHideStub);
        assert.ok(true);
      });
    });
  },
);
