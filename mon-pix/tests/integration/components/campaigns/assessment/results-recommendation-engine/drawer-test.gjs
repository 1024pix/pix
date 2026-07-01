import { render } from '@1024pix/ember-testing-library';
import { click, triggerEvent } from '@ember/test-helpers';
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
  });

  test('it displays the satisfaction score form by default', async function (assert) {
    // when
    const screen = await render(<template><Drawer @campaignId={{1}} /></template>);

    // then
    assert.dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.statement'))).isVisible();
  });

  module('when user selects a score', function () {
    test('it displays the thank you message', async function (assert) {
      // given
      const screen = await render(<template><Drawer @campaignId={{1}} /></template>);

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied'),
        }),
      );

      // then
      assert.dom(screen.getByText(t('pages.skill-review.recommended-engine.drawer.thank-you.title'))).isVisible();
    });

    test('it calls POST /api/user-campaign-surveys with campaignId and satisfactionScore', async function (assert) {
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
      assert.strictEqual(requestArgs.method, 'POST');
      const body = JSON.parse(requestArgs.body);
      assert.strictEqual(body.data.attributes['campaign-id'], 99);
      assert.strictEqual(body.data.attributes['satisfaction-score'], 5);
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
  });

  module('when user has submitted a score and clicks close', function () {
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
      assert.dom(screen.queryByText(t('pages.skill-review.recommended-engine.drawer.thank-you.title'))).doesNotExist();
    });
  });
});
