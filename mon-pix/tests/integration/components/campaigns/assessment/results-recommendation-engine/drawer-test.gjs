import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Drawer from 'mon-pix/components/campaigns/assessment/results-recommendation-engine/drawer';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | ResultsRecommendationEngine | Drawer', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.requestManagerStub = { request: sinon.stub().resolves() };
    this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });

    this.owner.register('service:current-user', { user: { id: 42 } });

    this.matchMediaStub = sinon.stub(window, 'matchMedia').returns({ matches: false });

    const sendErrorNotificationStub = sinon.stub();
    this.sendErrorNotificationStub = sendErrorNotificationStub;
    class PixToastStub extends Service {
      sendErrorNotification = sendErrorNotificationStub;
    }
    this.owner.register('service:pixToast', PixToastStub);
  });

  hooks.afterEach(function () {
    this.matchMediaStub.restore();
  });

  test('it displays the satisfaction score step by default', async function (assert) {
    // when
    const screen = await render(<template><Drawer @campaignId={{1}} /></template>);

    // then
    assert.dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.statement'))).isVisible();
  });

  module('on satisfaction step', function () {
    module('when user selects a satisfaction score', function () {
      test('it displays the content relevance form', async function (assert) {
        // given
        const screen = await render(<template><Drawer @campaignId={{1}} /></template>);

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied'),
          }),
        );

        // then
        assert
          .dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.content-relevance-form.title')))
          .isVisible();
      });

      test('it calls PUT /api/user-campaign-surveys with campaignId and satisfactionScore', async function (assert) {
        // given
        const screen = await render(<template><Drawer @campaignId={{99}} /></template>);

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied'),
          }),
        );

        // then
        sinon.assert.calledOnce(this.requestManagerStub.request);
        const [requestArgs] = this.requestManagerStub.request.firstCall.args;
        assert.ok(requestArgs.url.endsWith('/api/user-campaign-surveys'));
        assert.strictEqual(requestArgs.method, 'PUT');
        const body = JSON.parse(requestArgs.body);
        assert.strictEqual(body.data.attributes['campaign-id'], 99);
        assert.strictEqual(body.data.attributes['satisfaction-score'], 5);
      });

      test('it displays an error notification when the request fails', async function (assert) {
        // given
        this.requestManagerStub.request = sinon.stub().rejects();
        const screen = await render(<template><Drawer @campaignId={{1}} /></template>);

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied'),
          }),
        );

        // then
        sinon.assert.calledWith(this.sendErrorNotificationStub, {
          message: t('pages.skill-review.recommended-engine.drawer.error-message'),
        });
        assert.ok(true);
      });
    });

    module('when user clicks on "hide" button', function () {
      test('the drawer is removed', async function (assert) {
        // given
        const screen = await render(<template><Drawer @campaignId={{1}} /></template>);

        // when
        await click(
          screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.hide-aria-label') }),
        );
        await triggerEvent(document.querySelector('.results-recommendation-engine-drawer'), 'animationend', {
          animationName: 'drawer-slide-down',
        });

        // then
        assert.dom(screen.queryByText(t('pages.skill-review.recommended-engine.drawer.statement'))).doesNotExist();
      });

      test('it calls onHide as soon as the button is clicked, before the animation ends', async function (assert) {
        // given
        const onHide = sinon.stub();
        const screen = await render(<template><Drawer @campaignId={{1}} @onHide={{onHide}} /></template>);

        // when
        await click(
          screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.hide-aria-label') }),
        );

        // then
        sinon.assert.calledOnce(onHide);
        assert.ok(true);
      });

      module('when user prefers reduced motion', function (hooks) {
        hooks.beforeEach(function () {
          this.matchMediaStub.returns({ matches: true });
        });

        test('the drawer is removed without waiting for an animationend event', async function (assert) {
          // given
          const onHide = sinon.stub();
          const screen = await render(<template><Drawer @campaignId={{1}} @onHide={{onHide}} /></template>);

          // when
          await click(
            screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.hide-aria-label') }),
          );

          // then
          assert.dom(screen.queryByText(t('pages.skill-review.recommended-engine.drawer.statement'))).doesNotExist();
          sinon.assert.calledOnce(onHide);
        });
      });
    });
  });

  module('on content relevance form step', function () {
    module('when user submits the content relevance form', function () {
      test('it displays the thank you step', async function (assert) {
        // given
        const screen = await render(<template><Drawer @campaignId={{1}} /></template>);
        await click(
          screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied'),
          }),
        );
        const scoreLabel = t('pages.skill-review.recommended-engine.drawer.content-relevance-form.score-aria-label', {
          score: 5,
        });
        for (const axisLegendKey of ['usefulness', 'personalization', 'attractiveness']) {
          const scale = within(
            screen.getByRole('group', {
              name: t(`pages.skill-review.recommended-engine.drawer.content-relevance-form.${axisLegendKey}.legend`),
            }),
          );
          await click(scale.getByRole('radio', { name: scoreLabel }));
        }

        // when
        await click(screen.getByRole('button', { name: t('common.actions.send') }));

        // then
        assert.dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.thank-you.title'))).isVisible();
      });

      test('it calls PUT /api/user-campaign-surveys with campaignId, satisfaction and content relevance scores and comment', async function (assert) {
        // given
        const screen = await render(<template><Drawer @campaignId={{1}} /></template>);
        await click(
          screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied'),
          }),
        );
        const scoreLabel = t('pages.skill-review.recommended-engine.drawer.content-relevance-form.score-aria-label', {
          score: 5,
        });
        for (const axisLegendKey of ['usefulness', 'personalization', 'attractiveness']) {
          const scale = within(
            screen.getByRole('group', {
              name: t(`pages.skill-review.recommended-engine.drawer.content-relevance-form.${axisLegendKey}.legend`),
            }),
          );
          await click(scale.getByRole('radio', { name: scoreLabel }));
        }
        await fillIn(
          screen.getByRole('textbox', {
            name: t('pages.skill-review.recommended-engine.drawer.content-relevance-form.comment-text.label'),
          }),
          'youpi',
        );

        // when
        await click(screen.getByRole('button', { name: t('common.actions.send') }));

        // then
        const [requestArgs] = this.requestManagerStub.request.secondCall.args;
        assert.ok(requestArgs.url.endsWith('/api/user-campaign-surveys'));
        assert.strictEqual(requestArgs.method, 'PUT');
        const body = JSON.parse(requestArgs.body);
        assert.strictEqual(body.data.attributes['campaign-id'], 1);
        assert.strictEqual(body.data.attributes['usefulness-score'], 5);
        assert.strictEqual(body.data.attributes['personalization-score'], 5);
        assert.strictEqual(body.data.attributes['attractiveness-score'], 5);
        assert.strictEqual(body.data.attributes['satisfaction-score'], 5);
        assert.strictEqual(body.data.attributes['comment'], 'youpi');
      });

      test('it displays an error notification when the request fails', async function (assert) {
        // given
        const screen = await render(<template><Drawer @campaignId={{1}} /></template>);
        await click(
          screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied'),
          }),
        );
        const scoreLabel = t('pages.skill-review.recommended-engine.drawer.content-relevance-form.score-aria-label', {
          score: 5,
        });
        for (const axisLegendKey of ['usefulness', 'personalization', 'attractiveness']) {
          const scale = within(
            screen.getByRole('group', {
              name: t(`pages.skill-review.recommended-engine.drawer.content-relevance-form.${axisLegendKey}.legend`),
            }),
          );
          await click(scale.getByRole('radio', { name: scoreLabel }));
        }
        this.requestManagerStub.request = sinon.stub().rejects();

        // when
        await click(screen.getByRole('button', { name: t('common.actions.send') }));

        // then
        sinon.assert.calledWith(this.sendErrorNotificationStub, {
          message: t('pages.skill-review.recommended-engine.drawer.error-message'),
        });
        assert.ok(true);
      });
    });

    module('when user clicks on "hide" button', function () {
      test('the drawer is removed', async function (assert) {
        // given
        const screen = await render(<template><Drawer @campaignId={{1}} /></template>);
        await click(
          screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied'),
          }),
        );

        // when
        await click(
          screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.hide-aria-label') }),
        );
        await triggerEvent(document.querySelector('.results-recommendation-engine-drawer'), 'animationend', {
          animationName: 'drawer-slide-down',
        });

        // then
        assert
          .dom(screen.queryByText(t('pages.skill-review.recommended-engine.drawer.content-relevance-form.title')))
          .doesNotExist();
      });
    });
  });
});
