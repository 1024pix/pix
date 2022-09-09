import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import setupIntl from '../../helpers/setup-intl';
import ENV from 'mon-pix/config/environment';

const AUTHENTICATED_SOURCE_FROM_GAR = ENV.APP.AUTHENTICATED_SOURCE_FROM_GAR;

describe('Unit | Controller | Fill in Campaign Code', function () {
  setupIntlRenderingTest();
  setupIntl();

  let controller;
  let sessionStub;
  let currentUserStub;
  let eventStub;

  beforeEach(function () {
    controller = this.owner.lookup('controller:fill-in-campaign-code');
    const routerStub = { transitionTo: sinon.stub() };
    sessionStub = { invalidate: sinon.stub(), get: sinon.stub() };
    eventStub = { preventDefault: sinon.stub() };
    currentUserStub = { user: { firstName: 'John', lastname: 'Doe' } };
    controller.set('router', routerStub);
    controller.set('session', sessionStub);
    controller.set('currentUser', currentUserStub);
    controller.set('errorMessage', null);
    controller.set('campaignCode', null);
  });

  describe('#startCampaign', () => {
    context('when user is connected to his Mediacentre and redirected to a GAR campaign', function () {
      it('should redirect the user to the campaign entry point', async () => {
        // given
        const campaignCode = 'azerty1';
        const campaign = Symbol('someCampaign');
        const storeStub = {
          queryRecord: sinon
            .stub()
            .withArgs('campaign', { filter: { code: campaignCode } })
            .resolves(campaign),
        };
        sessionStub.get.returns('externalUserToken');
        controller.set('store', storeStub);
        controller.set('campaignCode', campaignCode);

        // when
        await controller.actions.startCampaign.call(controller, eventStub);

        // then
        sinon.assert.calledWith(controller.router.transitionTo, 'campaigns.entry-point', campaign.code);
      });
    });

    context('when user is connected to his Médiacentre and is already authenticated on Pix app', function () {
      it('should not see a modal and be redirect to the campaign entry point', async () => {
        // given
        const campaignCode = 'azerty1';
        const campaign = { code: campaignCode, identityProvider: 'GAR' };
        const storeStub = {
          queryRecord: sinon
            .stub()
            .withArgs('campaign', { filter: { code: campaignCode } })
            .resolves(campaign),
        };
        sessionStub.get.withArgs('data.authenticated.source').returns(AUTHENTICATED_SOURCE_FROM_GAR);
        sessionStub.get.withArgs('data.externalUser').returns(undefined);
        controller.set('store', storeStub);
        controller.set('campaignCode', campaignCode);

        // when
        await controller.actions.startCampaign.call(controller, eventStub);

        // then
        sinon.assert.calledWith(controller.router.transitionTo, 'campaigns.entry-point', campaign.code);
      });
    });

    context('when user is not connected to his Mediacentre', function () {
      context('and starts a campaign with GAR as identity provider', function () {
        it('should not redirect the user and display a modal', async function () {
          // given
          const campaignCode = 'LINKTOTHEPAST';
          const storeStub = {
            queryRecord: sinon
              .stub()
              .withArgs('campaign', { filter: { code: campaignCode } })
              .resolves({ code: campaignCode, identityProvider: 'GAR' }),
          };
          sessionStub.get.returns(undefined);
          controller.set('store', storeStub);
          controller.set('campaignCode', campaignCode);

          // when
          await controller.actions.startCampaign.call(controller, eventStub);

          // then
          sinon.assert.notCalled(controller.router.transitionTo);
          expect(controller.showGARModal).to.equal(true);
        });
      });
    });

    it('should set error when campaign code is empty', async () => {
      // given
      controller.set('campaignCode', '');

      // when
      await controller.actions.startCampaign.call(controller, eventStub);

      // then
      expect(controller.get('errorMessage')).to.equal('Veuillez saisir un code.');
    });

    it('should set error when no campaign found with code', async () => {
      // given
      const campaignCode = 'azerty1';
      controller.set('campaignCode', campaignCode);
      const storeStub = {
        queryRecord: sinon
          .stub()
          .withArgs('campaign', { filter: { code: campaignCode } })
          .rejects({ errors: [{ status: '404' }] }),
      };
      controller.set('store', storeStub);

      // when
      await controller.actions.startCampaign.call(controller, eventStub);

      // then
      expect(controller.get('errorMessage')).to.equal(
        'Votre code est erroné, veuillez vérifier ou contacter l’organisateur.'
      );
    });

    it('should set error when student is not authorized in campaign', async () => {
      // given
      const campaignCode = 'azerty1';
      controller.set('campaignCode', campaignCode);
      const storeStub = {
        queryRecord: sinon
          .stub()
          .withArgs('campaign', { filter: { code: campaignCode } })
          .rejects({ errors: [{ status: '403' }] }),
      };
      controller.set('store', storeStub);

      // When
      await controller.actions.startCampaign.call(controller, eventStub);

      // then
      expect(controller.get('errorMessage')).to.equal(
        'Oups ! nous ne parvenons pas à vous trouver. Vérifiez vos informations afin de continuer ou prévenez l’organisateur.'
      );
    });
  });

  describe('get firstTitle', () => {
    context('When user is not authenticated', () => {
      it('should return the not connected first title', () => {
        // given
        sessionStub.isAuthenticated = false;
        const expectedFirstTitle = controller.intl.t('pages.fill-in-campaign-code.first-title-not-connected');

        // when
        const firstTitle = controller.firstTitle;

        // then
        expect(firstTitle).to.equal(expectedFirstTitle);
      });
    });

    context('When user is authenticated', () => {
      it('should return the connected first title with user firstName', () => {
        // given
        sessionStub.isAuthenticated = true;
        const expectedFirstTitle = controller.intl.t('pages.fill-in-campaign-code.first-title-connected', {
          firstName: currentUserStub.user.firstName,
        });

        // when
        const firstTitle = controller.firstTitle;

        // then
        expect(firstTitle).to.equal(expectedFirstTitle);
      });
    });

    context('When user is anonymous', () => {
      it('should return the not connected first title', () => {
        // given
        sessionStub.isAuthenticated = true;
        currentUserStub.user.isAnonymous = true;
        const expectedFirstTitle = controller.intl.t('pages.fill-in-campaign-code.first-title-not-connected');

        // when
        const firstTitle = controller.firstTitle;

        // then
        expect(firstTitle).to.equal(expectedFirstTitle);
      });
    });
  });

  describe('get isUserAuthenticated', () => {
    it('should return session.isAuthenticated', () => {
      // given
      sessionStub.isAuthenticated = true;

      // when
      const isUserAuthenticated = controller.isUserAuthenticated;

      // then
      expect(isUserAuthenticated).to.equal(sessionStub.isAuthenticated);
    });
  });

  describe('get showWarningMessage', () => {
    it('should return true if user is authenticated and not anonymous', () => {
      // given
      sessionStub.isAuthenticated = true;
      currentUserStub.user.isAnonymous = false;

      // when
      const showWarningMessage = controller.showWarningMessage;

      // then
      expect(showWarningMessage).to.be.true;
    });

    it('should return false if user is not authenticated', () => {
      // given
      sessionStub.isAuthenticated = false;

      // when
      const showWarningMessage = controller.showWarningMessage;

      // then
      expect(showWarningMessage).to.be.false;
    });

    it('should return false if user is authenticated and anonymous', () => {
      // given
      sessionStub.isAuthenticated = true;
      currentUserStub.user.isAnonymous = true;

      // when
      const showWarningMessage = controller.showWarningMessage;

      // then
      expect(showWarningMessage).to.be.false;
    });
  });

  describe('#disconnect', () => {
    it('should invalidate the session', () => {
      // when
      controller.disconnect();

      // then
      sinon.assert.calledOnce(sessionStub.invalidate);
    });
  });
});
