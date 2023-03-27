import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import setupIntl from '../../helpers/setup-intl';
import Service from '@ember/service';

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
    sessionStub = { invalidate: sinon.stub(), get: sinon.stub() };
    eventStub = { preventDefault: sinon.stub() };
    currentUserStub = { user: { firstName: 'John', lastname: 'Doe' } };
    controller.set('router', routerStub);
    controller.set('session', sessionStub);
    controller.set('currentUser', currentUserStub);
    controller.set('errorMessage', null);
    controller.set('campaignCode', null);
  });

  module('#startCampaign', function () {
    module('campaign does not have GAR as identity provider', function () {
      test('should not show GAR modal', async function (assert) {
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
        assert.false(controller.showGARModal);
      });
    });

    module('campaign has GAR as identity provider', function () {
      module('user is coming from GAR', function () {
        test('should not show GAR modal', async function (assert) {
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
          assert.false(controller.showGARModal);
        });
      });

      module('user is not coming from GAR', function () {
        module('user is authenticated', function () {
          test('should not show GAR modal', async function (assert) {
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
            assert.false(controller.showGARModal);
          });
        });

        module('user is not authenticated', function () {
          test('should show GAR modal', async function (assert) {
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
            assert.true(controller.showGARModal);
          });
        });
      });
    });

    test('should set error when campaign code is empty', async function (assert) {
      // given
      controller.set('campaignCode', '');

      // when
      await controller.actions.startCampaign.call(controller, eventStub);

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(controller.get('errorMessage'), controller.intl.t('pages.fill-in-campaign-code.errors.not-found'));
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(firstTitle, expectedFirstTitle);
      });
    });
  });

  module('get isUserAuthenticatedByPix', function () {
    test('should return session.isAuthenticated', function (assert) {
      // given
      sessionStub.isAuthenticated = true;

      // when
      const isUserAuthenticatedByPix = controller.isUserAuthenticatedByPix;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(isUserAuthenticatedByPix, sessionStub.isAuthenticated);
    });
  });

  module('get isUserAuthenticatedByGAR', function () {
    test('returns true if an external user token is present', function (assert) {
      // given
      sessionStub.get.withArgs('data.externalUser').returns('TOKEN_FROM_GAR');
      controller.set('session', sessionStub);

      // when
      const isUserAuthenticatedByGAR = controller.isUserAuthenticatedByGAR;

      // then
      assert.true(isUserAuthenticatedByGAR);
    });

    test('returns false if there is no external user token in session', function (assert) {
      // given
      sessionStub.get.withArgs('data.externalUser').returns(undefined);
      controller.set('session', sessionStub);

      // when
      const isUserAuthenticatedByGAR = controller.isUserAuthenticatedByGAR;

      // then
      assert.false(isUserAuthenticatedByGAR);
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
      sinon.assert.calledOnce(sessionStub.invalidate);
      assert.ok(true);
    });
  });
});
