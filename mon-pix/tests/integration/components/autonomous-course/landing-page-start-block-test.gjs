import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import LandingPageStartBlock from 'mon-pix/components/autonomous-course/landing-page-start-block';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubSessionService } from '../../../helpers/service-stubs.js';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Autonomous Course | Landing page start block', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display title and custom landing page text', async function (assert) {
    // given
    const model = {
      title: 'dummy landing page title',
      customLandingPageText: 'dummy landing page text',
    };

    // when
    const screen = await render(<template><LandingPageStartBlock @campaign={{model}} /></template>);

    // then
    assert
      .dom(screen.getByText(`${t('pages.autonomous-course.landing-page.texts.title')} dummy landing page title`))
      .exists();
    assert.dom(screen.getByText('dummy landing page text')).exists();
  });

  module('when user is anonymous', function (hooks) {
    let sessionService;

    hooks.beforeEach(function () {
      sessionService = stubSessionService(this.owner, { isAuthenticated: false });
    });

    test('should display the launcher block', async function (assert) {
      // when
      const screen = await render(<template><LandingPageStartBlock /></template>);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: t('pages.autonomous-course.landing-page.actions.start-anonymously'),
          }),
        )
        .exists();
    });

    test('should start campaign participation on main button click', async function (assert) {
      // given
      const startCampaignParticipation = sinon.stub();

      // when
      const screen = await render(
        <template><LandingPageStartBlock @startCampaignParticipation={{startCampaignParticipation}} /></template>,
      );

      // then
      await click(
        screen.getByRole('button', {
          name: t('pages.autonomous-course.landing-page.actions.start-anonymously'),
        }),
      );
      sinon.assert.calledOnce(startCampaignParticipation);
      assert.ok(true);
    });

    test('should redirect to log-in form on specific button click', async function (assert) {
      sessionService.requireAuthenticationAndApprovedTermsOfService = sinon.stub().resolves();

      const startCampaignParticipation = sinon.stub().returns('stubbed-transition');

      // when
      const screen = await render(
        <template><LandingPageStartBlock @startCampaignParticipation={{startCampaignParticipation}} /></template>,
      );

      // then
      await click(
        screen.getByRole('button', {
          name: t('pages.autonomous-course.landing-page.actions.sign-in'),
        }),
      );
      sinon.assert.calledWith(sessionService.requireAuthenticationAndApprovedTermsOfService, 'stubbed-transition');
      assert.ok(true);
    });
  });

  module('when user is logged', function () {
    test('should start campaign participation on main button click', async function (assert) {
      // given
      stubSessionService(this.owner, { isAuthenticated: true });
      const startCampaignParticipation = sinon.stub();

      // when
      const screen = await render(
        <template><LandingPageStartBlock @startCampaignParticipation={{startCampaignParticipation}} /></template>,
      );

      // then
      await click(
        screen.getByRole('button', {
          name: t('pages.autonomous-course.landing-page.actions.start-connected'),
        }),
      );
      sinon.assert.calledOnce(startCampaignParticipation);
      assert.ok(true);
    });
  });
});
