import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ContentRelevanceForm from 'mon-pix/components/campaigns/assessment/results-recommendation-engine/drawer/content-relevance-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | ResultsRecommendationEngine | Drawer | ContentRelevanceForm',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    async function selectScore({ screen, legendKey, scoreLabel }) {
      const scale = within(screen.getByRole('group', { name: t(legendKey) }));
      await click(scale.getByRole('radio', { name: scoreLabel }));
    }

    test('it displays the title, subtitle, the three rating scales and a comment text-area', async function (assert) {
      // when
      const onSubmit = sinon.stub();
      const onHide = sinon.stub();
      const screen = await render(
        <template><ContentRelevanceForm @onSubmit={{onSubmit}} @onHide={{onHide}} /></template>,
      );

      // then
      assert
        .dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.content-relevance-form.title')))
        .isVisible();
      assert
        .dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.content-relevance-form.subtitle')))
        .isVisible();
      assert
        .dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.content-relevance-form.instruction')))
        .isVisible();
      assert
        .dom(
          screen.getByText(
            t('pages.skill-review.recommended-engine.drawer.content-relevance-form.usefulness.min-label'),
          ),
        )
        .isVisible();
      assert
        .dom(
          screen.getByText(
            t('pages.skill-review.recommended-engine.drawer.content-relevance-form.usefulness.max-label'),
          ),
        )
        .isVisible();
      assert.strictEqual(screen.getAllByRole('radio').length, 15);
      assert.dom(screen.getByRole('textbox', { name: 'Commentaire facultatif' })).exists();
    });

    test('the submit button is disabled until the three scales have a selected score', async function (assert) {
      // given
      const onSubmit = sinon.stub();
      const onHide = sinon.stub();
      const screen = await render(
        <template><ContentRelevanceForm @onSubmit={{onSubmit}} @onHide={{onHide}} /></template>,
      );
      const submitButton = screen.getByRole('button', { name: t('common.actions.send') });
      const scoreLabel = t('pages.skill-review.recommended-engine.drawer.content-relevance-form.score-aria-label', {
        score: 5,
      });

      // then
      assert.dom(submitButton).hasAttribute('aria-disabled', 'true');

      // when
      await selectScore({
        screen,
        legendKey: 'pages.skill-review.recommended-engine.drawer.content-relevance-form.usefulness.legend',
        scoreLabel,
      });
      await selectScore({
        screen,
        legendKey: 'pages.skill-review.recommended-engine.drawer.content-relevance-form.personalization.legend',
        scoreLabel,
      });

      // then
      assert.dom(submitButton).hasAttribute('aria-disabled', 'true');

      // when
      await selectScore({
        screen,
        legendKey: 'pages.skill-review.recommended-engine.drawer.content-relevance-form.attractiveness.legend',
        scoreLabel,
      });

      // then
      assert.dom(submitButton).doesNotHaveAttribute('aria-disabled', 'true');
    });

    test('it calls onSubmit with the three selected scores', async function (assert) {
      // given
      const onSubmit = sinon.stub();
      const onHide = sinon.stub();
      const screen = await render(
        <template><ContentRelevanceForm @onSubmit={{onSubmit}} @onHide={{onHide}} /></template>,
      );

      // when
      await selectScore({
        screen,
        legendKey: 'pages.skill-review.recommended-engine.drawer.content-relevance-form.usefulness.legend',
        scoreLabel: t('pages.skill-review.recommended-engine.drawer.content-relevance-form.score-aria-label', {
          score: 4,
        }),
      });
      await selectScore({
        screen,
        legendKey: 'pages.skill-review.recommended-engine.drawer.content-relevance-form.personalization.legend',
        scoreLabel: t('pages.skill-review.recommended-engine.drawer.content-relevance-form.score-aria-label', {
          score: 5,
        }),
      });
      await selectScore({
        screen,
        legendKey: 'pages.skill-review.recommended-engine.drawer.content-relevance-form.attractiveness.legend',
        scoreLabel: t('pages.skill-review.recommended-engine.drawer.content-relevance-form.score-aria-label', {
          score: 5,
        }),
      });
      await click(screen.getByRole('button', { name: t('common.actions.send') }));

      // then
      assert.true(
        onSubmit.calledOnceWithExactly({
          scores: {
            usefulness: 4,
            personalization: 5,
            attractiveness: 5,
          },
          comment: null,
        }),
      );
    });

    test('it calls onHide when the quit button is clicked', async function (assert) {
      // given
      const onSubmit = sinon.stub();
      const onHide = sinon.stub();
      const screen = await render(
        <template><ContentRelevanceForm @onSubmit={{onSubmit}} @onHide={{onHide}} /></template>,
      );

      // when
      await click(
        screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.hide-aria-label') }),
      );

      // then
      assert.true(onHide.calledOnce);
    });
  },
);
