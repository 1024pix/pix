import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import setupIntl from '../../helpers/setup-intl';

module('Unit | Controller | Fill in Campaign Code', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupIntl(hooks);

  let controller;
  let sessionStub;
  let currentUserStub;
  let eventStub;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:fill-in-campaign-code');
    const routerStub = { transitionTo: sinon.stub() };
    sessionStub = { invalidate: sinon.stub() };
    eventStub = { preventDefault: sinon.stub() };
    currentUserStub = { user: { firstName: 'John', lastname: 'Doe' } };
    controller.set('router', routerStub);
    controller.set('session', sessionStub);
    controller.set('currentUser', currentUserStub);
    controller.set('errorMessage', null);
    controller.set('campaignCode', null);
  });

  module('#startCampaign', function () {
    test('should call entry-point', async function (assert) {
      // given
      const campaignCode = 'azerty1';
      const campaign = Symbol('someCampaign');
      const storeStub = {
        queryRecord: sinon
          .stub()
          .withArgs('campaign', { filter: { code: campaignCode } })
          .resolves(campaign),
      };
      controller.set('store', storeStub);
      controller.set('campaignCode', campaignCode);

      // when
      await controller.actions.startCampaign.call(controller, eventStub);

      // then
      assert.expect(0);
      sinon.assert.calledWith(controller.router.transitionTo, 'campaigns.entry-point', campaign.code);
    });

    test('should set error when campaign code is empty', async function (assert) {
      // given
      controller.set('campaignCode', '');

      // when
      await controller.actions.startCampaign.call(controller, eventStub);

      // then
      assert.equal(controller.get('errorMessage'), 'Veuillez saisir un code.');
    });

    test('should set error when no campaign found with code', async function (assert) {
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
      assert.equal(
        controller.get('errorMessage'),
        'Votre code est erroné, veuillez vérifier ou contacter l’organisateur.'
      );
    });

    test('should set error when student is not authorized in campaign', async function (assert) {
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
      assert.equal(
        controller.get('errorMessage'),
        'Oups ! nous ne parvenons pas à vous trouver. Vérifiez vos informations afin de continuer ou prévenez l’organisateur.'
      );
    });
  });

  module('get firstTitle', function () {
    module('When user is not authenticated', function () {
      test('should return the not connected first title', function (assert) {
        // given
        sessionStub.isAuthenticated = false;
        const expectedFirstTitle = controller.intl.t('pages.fill-in-campaign-code.first-title-not-connected');

        // when
        const firstTitle = controller.firstTitle;

        // then
        assert.equal(firstTitle, expectedFirstTitle);
      });
    });

    module('When user is authenticated', function () {
      test('should return the connected first title with user firstName', function (assert) {
        // given
        sessionStub.isAuthenticated = true;
        const expectedFirstTitle = controller.intl.t('pages.fill-in-campaign-code.first-title-connected', {
          firstName: currentUserStub.user.firstName,
        });

        // when
        const firstTitle = controller.firstTitle;

        // then
        assert.equal(firstTitle, expectedFirstTitle);
      });
    });

    module('When user is anonymous', function () {
      test('should return the not connected first title', function (assert) {
        // given
        sessionStub.isAuthenticated = true;
        currentUserStub.user.isAnonymous = true;
        const expectedFirstTitle = controller.intl.t('pages.fill-in-campaign-code.first-title-not-connected');

        // when
        const firstTitle = controller.firstTitle;

        // then
        assert.equal(firstTitle, expectedFirstTitle);
      });
    });
  });

  module('get isUserAuthenticated', function () {
    test('should return session.isAuthenticated', function (assert) {
      // given
      sessionStub.isAuthenticated = true;

      // when
      const isUserAuthenticated = controller.isUserAuthenticated;

      // then
      assert.equal(isUserAuthenticated, sessionStub.isAuthenticated);
    });
  });

  module('get showWarningMessage', function () {
    test('should return true if user is authenticated and not anonymous', function (assert) {
      // given
      sessionStub.isAuthenticated = true;
      currentUserStub.user.isAnonymous = false;

      // when
      const showWarningMessage = controller.showWarningMessage;

      // then
      assert.true(showWarningMessage);
    });

    test('should return false if user is not authenticated', function (assert) {
      // given
      sessionStub.isAuthenticated = false;

      // when
      const showWarningMessage = controller.showWarningMessage;

      // then
      assert.false(showWarningMessage);
    });

    test('should return false if user is authenticated and anonymous', function (assert) {
      // given
      sessionStub.isAuthenticated = true;
      currentUserStub.user.isAnonymous = true;

      // when
      const showWarningMessage = controller.showWarningMessage;

      // then
      assert.false(showWarningMessage);
    });
  });

  module('#disconnect', function () {
    test('should invalidate the session', function (assert) {
      // when
      controller.disconnect();

      // then
      assert.expect(0);
      sinon.assert.calledOnce(sessionStub.invalidate);
    });
  });
});
