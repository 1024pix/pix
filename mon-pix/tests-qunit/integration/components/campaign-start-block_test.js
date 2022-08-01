import { module, test } from 'qunit';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import { contains } from '../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import { clickByLabel } from '../../helpers/click-by-label';
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
      await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      // then
      assert.dom(find('[src="http://orga.com/logo.png"][alt="My organisation"]')).exists();
      assert.dom(contains('My campaign text')).exists();
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
      await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      // then
      assert
        .dom(
          contains(this.intl.t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' }))
        )
        .exists();
      assert.dom(contains(this.intl.t('pages.campaign-landing.warning-message-logout'))).exists();
    });

    test('should call session.invalidate to shut down the session when user click on disconnect', async function (assert) {
      // when
      await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      await clickByLabel(this.intl.t('pages.campaign-landing.warning-message-logout'));

      // then
      assert.expect(0);
      sinon.assert.calledOnce(session.invalidate);
    });

    module('when the campaign is a PROFILES_COLLECTION type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { type: 'PROFILES_COLLECTION' });
      });

      test('should display all text arguments correctly', async function (assert) {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        assert.dom(contains(this.intl.t('pages.campaign-landing.profiles-collection.announcement'))).exists();
        assert.dom(contains(this.intl.t('pages.campaign-landing.profiles-collection.action'))).exists();
        assert.dom(contains(this.intl.t('pages.campaign-landing.profiles-collection.legal'))).exists();
      });

      test('should display the userName', async function (assert) {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        assert.dom(contains('Izuku')).exists();
        assert.dom(contains('envoyez votre profil')).exists();
      });
    });

    module('when the campaign is a ASSESSMENT type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { isAssessment: true });
      });
      test('should display all text arguments correctly', async function (assert) {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        assert.dom(contains("Démarrez votre parcours d'évaluation personnalisé.")).exists();
        assert.dom(contains(this.intl.t('pages.campaign-landing.assessment.action'))).exists();
        assert.dom(contains(this.intl.t('pages.campaign-landing.assessment.legal'))).exists();
      });

      test('should display the userName', async function (assert) {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        assert.dom(contains('Izuku')).exists();
        assert.dom(contains('commencez votre parcours')).exists();
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
      await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      // then
      assert
        .dom(
          contains(this.intl.t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' }))
        )
        .doesNotExist();
      assert.dom(contains(this.intl.t('pages.campaign-landing.warning-message-logout'))).doesNotExist();
    });

    module('when the campaign is a PROFILES_COLLECTION type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { type: 'PROFILES_COLLECTION' });
      });

      test('should not display the userName', async function (assert) {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        assert.dom(contains(this.intl.t('pages.campaign-landing.profiles-collection.title'))).exists();
      });
    });

    module('when the campaign is a ASSESSMENT type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { isAssessment: true });
      });

      test('should not display the userName', async function (assert) {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        assert.dom(contains(this.intl.t('pages.campaign-landing.assessment.title'))).exists();
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
      await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      // then
      assert
        .dom(
          contains(this.intl.t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' }))
        )
        .doesNotExist();
      assert.dom(contains(this.intl.t('pages.campaign-landing.warning-message-logout'))).doesNotExist();
    });

    module('when the campaign is a PROFILES_COLLECTION type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { type: 'PROFILES_COLLECTION' });
      });

      test('should not display the userName', async function (assert) {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        assert.dom(contains(this.intl.t('pages.campaign-landing.profiles-collection.title'))).exists();
      });
    });

    module('when the campaign is a ASSESSMENT type', function (hooks) {
      hooks.beforeEach(function () {
        this.set('campaign', { isAssessment: true });
      });

      test('should not display the userName', async function (assert) {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        assert.dom(contains(this.intl.t('pages.campaign-landing.assessment.title'))).exists();
      });
    });
  });
});
