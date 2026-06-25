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

    this.owner.register('service:current-user', { user: { id: 42 } }, { instantiate: false });
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

    test('it calls POST /api/user-campaign-surveys with userId, campaignId and satisfactionScore', async function (assert) {
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
      assert.strictEqual(body.data.attributes.userId, 42);
      assert.strictEqual(body.data.attributes.campaignId, 99);
      assert.strictEqual(body.data.attributes.satisfactionScore, 5);
    });
  });

  module('when user clicks hide', function () {
    test('the drawer starts the closing animation', async function (assert) {
      // given
      const screen = await render(<template><Drawer @campaignId={{1}} /></template>);

      // when
      await click(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.hide') }));

      // then
      assert.dom(screen.container.querySelector('.results-recommendation-engine-drawer--hiding')).exists();
    });

    test('the drawer is removed from the DOM once the animation ends', async function (assert) {
      // given
      const screen = await render(<template><Drawer @campaignId={{1}} /></template>);
      await click(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.drawer.hide') }));
      const section = screen.container.querySelector('.results-recommendation-engine-drawer');

      // when
      await triggerEvent(section, 'animationend', { animationName: 'drawer-slide-down' });

      // then
      assert.dom(screen.container.querySelector('.results-recommendation-engine-drawer')).doesNotExist();
    });
  });

  module('when user has submitted a score and clicks close', function () {
    test('the drawer starts the closing animation', async function (assert) {
      // given
      const screen = await render(<template><Drawer @campaignId={{1}} /></template>);
      await click(
        screen.getByRole('button', {
          name: t('pages.skill-review.recommended-engine.drawer.emojis.very-satisfied'),
        }),
      );

      // when
      await click(screen.getByRole('button', { name: t('common.actions.close') }));

      // then
      assert.dom(screen.container.querySelector('.results-recommendation-engine-drawer--hiding')).exists();
    });
  });
});
