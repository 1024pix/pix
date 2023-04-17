import { module, test } from 'qunit';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

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
      const screen = await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      // then
      assert.dom(screen.getByRole('img', { name: 'My organisation' })).hasAttribute('src', 'http://orga.com/logo.png');
      assert
        .dom(
          screen.getByRole('heading', {
            name: this.intl.t('pages.campaign-landing.profiles-collection.announcement'),
            level: 2,
          })
        )
        .exists();
      assert.dom(screen.getByText('My campaign text')).exists();
    });
  });

  module('When the user is authenticated', function (hooks) {
    let session;

    hooks.beforeEach(function () {
      class currentUser extends Service {
        user = {
          firstName: 'Izuku',
          lastName: 'Midorya',
          isAnonymous: false,
        };
      }

      this.owner.register('service:currentUser', currentUser);

      class SessionStub extends Service {
        isAuthenticated = true;
        invalidate = sinon.stub();
      }

      this.owner.register('service:session', SessionStub);
      session = this.owner.lookup('service:session', SessionStub);
      this.set('campaign', {});
      this.set('startCampaignParticipation', sinon.stub());
    });

    test('should display the link to disconnect', async function (assert) {
      // when
      const screen = await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      // then
      assert.ok(
        screen.getByText(
          this.intl.t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' })
        )
      );
      assert
        .dom(screen.getByRole('link', { name: this.intl.t('pages.campaign-landing.warning-message-logout') }))
        .exists();
    });

    test('should call session.invalidate to shut down the session when user click on disconnect', async function (assert) {
      // when
      const screen = await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      await click(screen.getByRole('link', { name: this.intl.t('pages.campaign-landing.warning-message-logout') }));

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
        const screen = await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        assert
          .dom(
            screen.queryByRole('heading', {
              name: this.intl.t('pages.campaign-landing.profiles-collection.announcement'),
            })
          )
          .doesNotExist();
        assert
          .dom(
            screen.getByRole('button', {
              name: this.intl.t('pages.campaign-landing.profiles-collection.action'),
            })
          )
          .exists();
        assert.dom(screen.getByText(this.intl.t('pages.campaign-landing.profiles-collection.legal'))).exists();
      });

      test('should display the userName', async function (assert) {
        // when
        const screen = await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Izuku, envoyez votre profil',
              level: 1,
            })
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
        const screen = await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        assert
          .dom(
            screen.queryByRole('heading', {
              name: this.intl.t('pages.campaign-landing.profiles-collection.announcement'),
            })
          )
          .doesNotExist();
        assert
          .dom(
            screen.getByRole('button', {
              name: this.intl.t('pages.campaign-landing.assessment.action'),
            })
          )
          .exists();
        assert.dom(screen.getByText(this.intl.t('pages.campaign-landing.assessment.legal'))).exists();
      });

      test('should display the userName', async function (assert) {
        // when
        const screen = await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Izuku, commencez votre parcours',
              level: 1,
            })
          )
          .exists();
      });
    });
  });

  module('When the user is not authenticated', function (hooks) {
    hooks.beforeEach(function () {
      class currentUser extends Service {
        user = {
          firstName: 'Izuku',
          lastName: 'Midorya',
          isAnonymous: false,
        };
      }

      this.owner.register('service:currentUser', currentUser);

      class SessionStub extends Service {
        isAuthenticated = false;
        invalidate = sinon.stub();
      }

      this.owner.register('service:session', SessionStub);
      this.set('campaign', {});
      this.set('startCampaignParticipation', sinon.stub());
    });

    test('should not display the link to disconnect', async function (assert) {
      // when
      const screen = await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      // then
      assert
        .dom(screen.queryByRole('link', { name: this.intl.t('pages.campaign-landing.warning-message-logout') }))
        .doesNotExist();
      assert
        .dom(
          screen.queryByText(
            this.intl.t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' })
          )
        )
        .doesNotExist();
    });

    module('when the campaign is a PROFILES_COLLECTION type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { type: 'PROFILES_COLLECTION' });
      });

      test('should not display the userName', async function (assert) {
        // when
        const screen = await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Envoyez votre profil',
              level: 1,
            })
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
        const screen = await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Commencez votre parcours Pix',
              level: 1,
            })
          )
          .exists();
      });
    });
  });

  module('When the user has isAnonymous', function (hooks) {
    hooks.beforeEach(function () {
      class currentUser extends Service {
        user = {
          firstName: 'Izuku',
          lastName: 'Midorya',
          isAnonymous: true,
        };
      }

      this.owner.register('service:currentUser', currentUser);

      class SessionStub extends Service {
        isAuthenticated = true;
        invalidate = sinon.stub();
      }

      this.owner.register('service:session', SessionStub);
      this.set('campaign', {});
      this.set('startCampaignParticipation', sinon.stub());
    });

    test('should not display the link to disconnect', async function (assert) {
      // when
      const screen = await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      // then
      assert
        .dom(screen.queryByRole('link', { name: this.intl.t('pages.campaign-landing.warning-message-logout') }))
        .doesNotExist();
      assert
        .dom(
          screen.queryByText(
            this.intl.t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' })
          )
        )
        .doesNotExist();
    });

    module('when the campaign is a PROFILES_COLLECTION type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { type: 'PROFILES_COLLECTION' });
      });

      test('should not display the userName', async function (assert) {
        // when
        const screen = await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Envoyez votre profil',
              level: 1,
            })
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
        const screen = await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Commencez votre parcours Pix',
              level: 1,
            })
          )
          .exists();
      });
    });
  });
});
