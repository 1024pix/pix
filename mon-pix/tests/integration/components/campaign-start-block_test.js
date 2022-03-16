import { expect } from 'chai';
import { describe, it } from 'mocha';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import { contains } from '../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import { clickByLabel } from '../../helpers/click-by-label';
import sinon from 'sinon';

describe('Integration | Component | campaign-start-block', function () {
  setupIntlRenderingTest();

  context('When the organization has a logo and landing page text', function () {
    it('should display organization logo and landing page text', async function () {
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
      expect(find('[src="http://orga.com/logo.png"][alt="My organisation"]')).to.exist;
      expect(contains('My campaign text')).to.exist;
    });
  });

  describe('When the user is authenticated', function () {
    let session;

    beforeEach(function () {
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

    it('should display the link to disconnect', async function () {
      // when
      await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      // then
      expect(
        contains(this.intl.t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' }))
      ).to.exist;
      expect(contains(this.intl.t('pages.campaign-landing.warning-message-logout'))).to.exist;
    });

    it('should call session.invalidate to shut down the session when user click on disconnect', async function () {
      // when
      await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      await clickByLabel(this.intl.t('pages.campaign-landing.warning-message-logout'));

      // then
      sinon.assert.calledOnce(session.invalidate);
    });

    context('when the campaign is a PROFILES_COLLECTION type', function () {
      this.beforeEach(function () {
        this.set('campaign', { type: 'PROFILES_COLLECTION' });
      });

      it('should display all text arguments correctly', async function () {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        expect(contains(this.intl.t('pages.campaign-landing.profiles-collection.announcement'))).to.exist;
        expect(contains(this.intl.t('pages.campaign-landing.profiles-collection.action'))).to.exist;
        expect(contains(this.intl.t('pages.campaign-landing.profiles-collection.legal'))).to.exist;
      });

      it('should display the userName', async function () {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        expect(contains('Izuku')).to.exist;
        expect(contains('envoyez votre profil')).to.exist;
      });
    });

    context('when the campaign is a ASSESSMENT type', function () {
      this.beforeEach(function () {
        this.set('campaign', { isAssessment: true });
      });
      it('should display all text arguments correctly', async function () {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        expect(contains("Démarrez votre parcours d'évaluation personnalisé.")).to.exist;
        expect(contains(this.intl.t('pages.campaign-landing.assessment.action'))).to.exist;
        expect(contains(this.intl.t('pages.campaign-landing.assessment.legal'))).to.exist;
      });

      it('should display the userName', async function () {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);

        // then
        expect(contains('Izuku')).to.exist;
        expect(contains('commencez votre parcours')).to.exist;
      });
    });
  });

  describe('When the user is not authenticated', function () {
    beforeEach(function () {
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

    it('should not display the link to disconnect', async function () {
      // when
      await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      // then
      expect(
        contains(this.intl.t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' }))
      ).to.not.exist;
      expect(contains(this.intl.t('pages.campaign-landing.warning-message-logout'))).to.not.exist;
    });

    context('when the campaign is a PROFILES_COLLECTION type', function () {
      this.beforeEach(function () {
        this.set('campaign', { type: 'PROFILES_COLLECTION' });
      });

      it('should not display the userName', async function () {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        expect(contains(this.intl.t('pages.campaign-landing.profiles-collection.title'))).to.exist;
      });
    });

    context('when the campaign is a ASSESSMENT type', function () {
      this.beforeEach(function () {
        this.set('campaign', { isAssessment: true });
      });

      it('should not display the userName', async function () {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        expect(contains(this.intl.t('pages.campaign-landing.assessment.title'))).to.exist;
      });
    });
  });

  describe('When the user has isAnonymous', function () {
    beforeEach(function () {
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

    it('should not display the link to disconnect', async function () {
      // when
      await render(hbs`
        <CampaignStartBlock
          @campaign={{this.campaign}}
          @startCampaignParticipation={{this.startCampaignParticipation}}
        />`);

      // then
      expect(
        contains(this.intl.t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' }))
      ).to.not.exist;
      expect(contains(this.intl.t('pages.campaign-landing.warning-message-logout'))).to.not.exist;
    });

    context('when the campaign is a PROFILES_COLLECTION type', function () {
      this.beforeEach(function () {
        this.set('campaign', { type: 'PROFILES_COLLECTION' });
      });

      it('should not display the userName', async function () {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        expect(contains(this.intl.t('pages.campaign-landing.profiles-collection.title'))).to.exist;
      });
    });

    context('when the campaign is a ASSESSMENT type', function () {
      this.beforeEach(function () {
        this.set('campaign', { isAssessment: true });
      });

      it('should not display the userName', async function () {
        // when
        await render(hbs`
          <CampaignStartBlock
            @campaign={{this.campaign}}
            @startCampaignParticipation={{this.startCampaignParticipation}}
          />`);
        // then
        expect(contains(this.intl.t('pages.campaign-landing.assessment.title'))).to.exist;
      });
    });
  });
});
