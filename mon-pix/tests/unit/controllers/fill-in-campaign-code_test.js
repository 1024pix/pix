import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import setupIntl from '../../helpers/setup-intl';
import Service from '@ember/service';

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

  describe('#startCampaign', function () {
    context('campaign does not have GAR as identity provider', function () {
      it('should not show GAR modal', async function () {
        // given
        const campaignCode = 'LINKTOTHEPAST';
        const storeStub = {
          queryRecord: sinon
            .stub()
            .withArgs('campaign', { filter: { code: campaignCode } })
            .resolves({ code: campaignCode, identityProvider: 'FRANCE DECONNECT' }),
        };
        controller.set('store', storeStub);
        controller.set('campaignCode', campaignCode);

        // when
        await controller.actions.startCampaign.call(controller, eventStub);

        // then
        expect(controller.showGARModal).to.equal(false);
      });
    });

    context('campaign has GAR as identity provider', function () {
      context('user is coming from GAR', function () {
        it('should not show GAR modal', async function () {
          // given
          const campaignCode = 'LINKTOTHEPAST';
          const storeStub = {
            queryRecord: sinon
              .stub()
              .withArgs('campaign', { filter: { code: campaignCode } })
              .resolves({ code: campaignCode, identityProvider: 'GAR' }),
          };
          const sessionStub = Service.create({ data: { externalUser: true } });
          controller.set('store', storeStub);
          controller.set('campaignCode', campaignCode);
          controller.set('session', sessionStub);

          // when
          await controller.actions.startCampaign.call(controller, eventStub);

          // then
          expect(controller.showGARModal).to.equal(false);
        });
      });

      context('user is not coming from GAR', function () {
        context('user is authenticated', function () {
          it('should not show GAR modal', async function () {
            // given
            const campaignCode = 'LINKTOTHEPAST';
            const storeStub = {
              queryRecord: sinon
                .stub()
                .withArgs('campaign', { filter: { code: campaignCode } })
                .resolves({ code: campaignCode, identityProvider: 'GAR' }),
            };
            const sessionStub = Service.create({ isAuthenticated: true });
            controller.set('store', storeStub);
            controller.set('campaignCode', campaignCode);
            controller.set('session', sessionStub);

            // when
            await controller.actions.startCampaign.call(controller, eventStub);

            // then
            expect(controller.showGARModal).to.equal(false);
          });
        });

        context('user is not authenticated', function () {
          it('should show GAR modal', async function () {
            // given
            const campaignCode = 'LINKTOTHEPAST';
            const storeStub = {
              queryRecord: sinon
                .stub()
                .withArgs('campaign', { filter: { code: campaignCode } })
                .resolves({ code: campaignCode, identityProvider: 'GAR' }),
            };
            const sessionStub = Service.create({ isAuthenticated: false });
            controller.set('store', storeStub);
            controller.set('campaignCode', campaignCode);
            controller.set('session', sessionStub);

            // when
            await controller.actions.startCampaign.call(controller, eventStub);

            // then
            expect(controller.showGARModal).to.equal(true);
          });
        });
      });
    });

    it('should set error when campaign code is empty', async function () {
      // given
      controller.set('campaignCode', '');

      // when
      await controller.actions.startCampaign.call(controller, eventStub);

      // then
      expect(controller.get('errorMessage')).to.equal('Veuillez saisir un code.');
    });

    it('should set error when no campaign found with code', async function () {
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

    it('should set error when student is not authorized in campaign', async function () {
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

  describe('get firstTitle', function () {
    context('When user is not authenticated', function () {
      it('should return the not connected first title', function () {
        // given
        sessionStub.isAuthenticated = false;
        const expectedFirstTitle = controller.intl.t('pages.fill-in-campaign-code.first-title-not-connected');

        // when
        const firstTitle = controller.firstTitle;

        // then
        expect(firstTitle).to.equal(expectedFirstTitle);
      });
    });

    context('When user is authenticated', function () {
      it('should return the connected first title with user firstName', function () {
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

    context('When user is anonymous', function () {
      it('should return the not connected first title', function () {
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

  describe('get isUserAuthenticatedByPix', function () {
    it('should return session.isAuthenticated', function () {
      // given
      sessionStub.isAuthenticated = true;

      // when
      const isUserAuthenticatedByPix = controller.isUserAuthenticatedByPix;

      // then
      expect(isUserAuthenticatedByPix).to.equal(sessionStub.isAuthenticated);
    });
  });

  describe('get isUserAuthenticatedByGAR', function () {
    it('returns true if an external user token is present', function () {
      // given
      sessionStub.get.withArgs('data.externalUser').returns('TOKEN_FROM_GAR');
      controller.set('session', sessionStub);

      // when
      const isUserAuthenticatedByGAR = controller.isUserAuthenticatedByGAR;

      // then
      expect(isUserAuthenticatedByGAR).to.equal(true);
    });

    it('returns false if there is no external user token in session', function () {
      // given
      sessionStub.get.withArgs('data.externalUser').returns(undefined);
      controller.set('session', sessionStub);

      // when
      const isUserAuthenticatedByGAR = controller.isUserAuthenticatedByGAR;

      // then
      expect(isUserAuthenticatedByGAR).to.equal(false);
    });
  });

  describe('get showWarningMessage', function () {
    it('should return true if user is authenticated and not anonymous', function () {
      // given
      sessionStub.isAuthenticated = true;
      currentUserStub.user.isAnonymous = false;

      // when
      const showWarningMessage = controller.showWarningMessage;

      // then
      expect(showWarningMessage).to.be.true;
    });

    it('should return false if user is not authenticated', function () {
      // given
      sessionStub.isAuthenticated = false;

      // when
      const showWarningMessage = controller.showWarningMessage;

      // then
      expect(showWarningMessage).to.be.false;
    });

    it('should return false if user is authenticated and anonymous', function () {
      // given
      sessionStub.isAuthenticated = true;
      currentUserStub.user.isAnonymous = true;

      // when
      const showWarningMessage = controller.showWarningMessage;

      // then
      expect(showWarningMessage).to.be.false;
    });
  });

  describe('#disconnect', function () {
    it('should invalidate the session', function () {
      // when
      controller.disconnect();

      // then
      sinon.assert.calledOnce(sessionStub.invalidate);
    });
  });
});
