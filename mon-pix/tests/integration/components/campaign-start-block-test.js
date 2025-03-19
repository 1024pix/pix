import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService, stubSessionService } from '../../helpers/service-stubs';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | campaign-start-block', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When the organization has a logo and landing page text', function () {
    test('should display organization logo and landing page text', async function (assert) {
      // given
      this.set('campaign', {
        organizationName: 'My organisation',
        organizationLogoUrl: 'http://orga.com/logo.png',
        customLandingPageText: 'My campaign text',
      });
      this.set('startCampaignParticipation', sinon.stub());

      // when
      const screen = await render(
        hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
      );

      // then
      assert.dom(screen.getByRole('img', { name: 'My organisation' })).hasAttribute('src', 'http://orga.com/logo.png');
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('pages.campaign-landing.profiles-collection.announcement'),
            level: 2,
          }),
        )
        .exists();
      assert.dom(screen.getByText('My campaign text')).exists();
    });
  });

  module('When the user is authenticated', function (hooks) {
    let session;

    hooks.beforeEach(function () {
      stubCurrentUserService(this.owner, { firstName: 'Izuku', lastName: 'Midorya' });
      session = stubSessionService(this.owner, { isAuthenticated: true });

      this.set('campaign', {});
      this.set('startCampaignParticipation', sinon.stub());
    });

    test('should display the link to disconnect', async function (assert) {
      // when
      const screen = await render(
        hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
      );

      // then
      assert.ok(
        screen.getByText(t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' })),
      );
      assert.dom(screen.getByRole('link', { name: t('pages.campaign-landing.warning-message-logout') })).exists();
    });

    test('should call session.invalidate to shut down the session when user click on disconnect', async function (assert) {
      // when
      const screen = await render(
        hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
      );

      await click(screen.getByRole('link', { name: t('pages.campaign-landing.warning-message-logout') }));

      // then
      sinon.assert.calledOnce(session.invalidate);
      assert.ok(true);
    });

    module('when the campaign is a PROFILES_COLLECTION type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { type: 'PROFILES_COLLECTION' });
      });

      test('should display all text arguments correctly', async function (assert) {
        // when
        const screen = await render(
          hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
        );

        // then
        assert
          .dom(
            screen.queryByRole('heading', {
              name: t('pages.campaign-landing.profiles-collection.announcement'),
            }),
          )
          .doesNotExist();
        assert
          .dom(
            screen.getByRole('button', {
              name: t('pages.campaign-landing.profiles-collection.action'),
            }),
          )
          .exists();
        assert.dom(screen.getByText(t('pages.campaign-landing.profiles-collection.legal'))).exists();
      });

      test('should display the userName', async function (assert) {
        // when
        const screen = await render(
          hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Izuku, envoyez votre profil',
              level: 1,
            }),
          )
          .exists();
      });
    });

    module('when the campaign is a ASSESSMENT type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { isAssessment: true });
      });
      test('should display all text arguments correctly', async function (assert) {
        // when
        const screen = await render(
          hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
        );

        // then
        assert
          .dom(
            screen.queryByRole('heading', {
              name: t('pages.campaign-landing.profiles-collection.announcement'),
            }),
          )
          .doesNotExist();
        assert
          .dom(
            screen.getByRole('button', {
              name: t('pages.campaign-landing.assessment.action'),
            }),
          )
          .exists();
        assert.dom(screen.getByText(t('pages.campaign-landing.assessment.legal'))).exists();
      });

      test('should display the userName', async function (assert) {
        // when
        const screen = await render(
          hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Izuku, prêt à évaluer vos compétences numériques ?',
              level: 1,
            }),
          )
          .exists();
      });
    });

    module('when the campaign is a EXAM type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { isAssessment: false, isExam: true });
      });
      test('should display all text arguments correctly', async function (assert) {
        // when
        const screen = await render(
          hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
        );

        // then
        assert
          .dom(
            screen.queryByRole('heading', {
              name: t('pages.campaign-landing.profiles-collection.announcement'),
            }),
          )
          .doesNotExist();
        assert
          .dom(
            screen.getByRole('button', {
              name: t('pages.campaign-landing.assessment.action'),
            }),
          )
          .exists();
        assert.dom(screen.getByText(t('pages.campaign-landing.assessment.legal'))).exists();
      });

      test('should display the userName', async function (assert) {
        // when
        const screen = await render(
          hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Izuku, prêt à évaluer vos compétences numériques ?',
              level: 1,
            }),
          )
          .exists();
      });
    });
  });

  module('When the user is not authenticated', function (hooks) {
    hooks.beforeEach(function () {
      stubCurrentUserService(this.owner, { firstName: 'Izuku', lastName: 'Midorya' });
      stubSessionService(this.owner, { isAuthenticated: false });
      this.set('campaign', {});
      this.set('startCampaignParticipation', sinon.stub());
    });

    test('should not display the link to disconnect', async function (assert) {
      // when
      const screen = await render(
        hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
      );

      // then
      assert
        .dom(screen.queryByRole('link', { name: t('pages.campaign-landing.warning-message-logout') }))
        .doesNotExist();
      assert
        .dom(
          screen.queryByText(t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' })),
        )
        .doesNotExist();
    });

    module('when the campaign is a PROFILES_COLLECTION type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { type: 'PROFILES_COLLECTION' });
      });

      test('should not display the userName', async function (assert) {
        // when
        const screen = await render(
          hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Envoyez votre profil',
              level: 1,
            }),
          )
          .exists();
      });
    });

    module('when the campaign is a ASSESSMENT type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { isAssessment: true });
      });

      test('should not display the userName', async function (assert) {
        // when
        const screen = await render(
          hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Commencez votre parcours Pix',
              level: 1,
            }),
          )
          .exists();
      });
    });
  });

  module('When the user has isAnonymous', function (hooks) {
    hooks.beforeEach(function () {
      stubCurrentUserService(this.owner, { isAnonymous: true });
      stubSessionService(this.owner, { isAuthenticated: true });

      this.set('campaign', {});
      this.set('startCampaignParticipation', sinon.stub());
    });

    test('should not display the link to disconnect', async function (assert) {
      // when
      const screen = await render(
        hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
      );

      // then
      assert
        .dom(screen.queryByRole('link', { name: t('pages.campaign-landing.warning-message-logout') }))
        .doesNotExist();
      assert
        .dom(
          screen.queryByText(t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' })),
        )
        .doesNotExist();
    });

    module('when the campaign is a PROFILES_COLLECTION type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { type: 'PROFILES_COLLECTION' });
      });

      test('should not display the userName', async function (assert) {
        // when
        const screen = await render(
          hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Envoyez votre profil',
              level: 1,
            }),
          )
          .exists();
      });
    });

    module('when the campaign is a ASSESSMENT type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { isAssessment: true });
      });

      test('should not display the userName', async function (assert) {
        // when
        const screen = await render(
          hbs`<CampaignStartBlock @campaign={{this.campaign}} @startCampaignParticipation={{this.startCampaignParticipation}} />`,
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Commencez votre parcours Pix',
              level: 1,
            }),
          )
          .exists();
      });
    });
  });
});
