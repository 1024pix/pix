/* eslint ember/no-classic-classes: 0 */

import sinon from 'sinon';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Autonomous Course | Landing page start block', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display title and custom landing page text', async function (assert) {
    // given
    this.set('model', {
      title: 'dummy landing page title',
      customLandingPageText: 'dummy landing page text',
    });

    // when
    const screen = await render(hbs`<AutonomousCourse::LandingPageStartBlock @campaign={{this.model}} />`);

    // then
    assert
      .dom(
        screen.getByText(`${this.intl.t('pages.autonomous-course.landing-page.texts.title')} dummy landing page title`),
      )
      .exists();
    assert.dom(screen.getByText('dummy landing page text')).exists();
  });

  module('when user is anonymous', function () {
    test('should display the launcher block', async function (assert) {
      // when
      const screen = await render(hbs`<AutonomousCourse::LandingPageStartBlock />`);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: this.intl.t('pages.autonomous-course.landing-page.actions.start-anonymously'),
          }),
        )
        .exists();
    });

    test('should start campaign participation on main button click', async function (assert) {
      // given
      this.set('startCampaignParticipation', sinon.stub());

      // when
      const screen = await render(
        hbs`<AutonomousCourse::LandingPageStartBlock @startCampaignParticipation={{this.startCampaignParticipation}} />`,
      );

      // then
      await click(
        screen.getByRole('button', {
          name: this.intl.t('pages.autonomous-course.landing-page.actions.start-anonymously'),
        }),
      );
      sinon.assert.calledOnce(this.startCampaignParticipation);
      assert.ok(true);
    });

    test('should redirect to log-in form on specific button click', async function (assert) {
      // given
      class sessionService extends Service {
        requireAuthenticationAndApprovedTermsOfService = sinon.stub().resolves();
      }
      this.owner.register('service:session', sessionService);
      const session = this.owner.lookup('service:session', sessionService);

      this.set('startCampaignParticipation', sinon.stub());
      this.set('redirectToSigninIfUserIsAnonymous', sinon.stub());

      // when
      const screen = await render(
        hbs`<AutonomousCourse::LandingPageStartBlock @startCampaignParticipation={{this.startCampaignParticipation}} />`,
      );

      // then
      await click(
        screen.getByRole('button', {
          name: this.intl.t('pages.autonomous-course.landing-page.actions.sign-in'),
        }),
      );
      sinon.assert.calledOnce(session.requireAuthenticationAndApprovedTermsOfService);
      assert.ok(true);
    });
  });

  module('when user is logged', function () {
    test('should start campaign participation on main button click', async function (assert) {
      // given
      this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
      this.set('startCampaignParticipation', sinon.stub());

      // when
      const screen = await render(
        hbs`<AutonomousCourse::LandingPageStartBlock @startCampaignParticipation={{this.startCampaignParticipation}} />`,
      );

      // then
      await click(
        screen.getByRole('button', {
          name: this.intl.t('pages.autonomous-course.landing-page.actions.start-connected'),
        }),
      );
      sinon.assert.calledOnce(this.startCampaignParticipation);
      assert.ok(true);
    });
  });
});
