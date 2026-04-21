import sinon from 'sinon';

import { OpenidClientWithRetry } from '../../../../src/identity-access-management/domain/helpers/openid-client-with-retry.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';

import { createOpenIdClientMock } from '../../../tooling/mocks/openid-client.mock.js';

describe('Unit | Identity Access Management | Domain | Helper | openid-client-with-retry', function () {
  const durationInMs = 0;

  let openidClient;

  beforeEach(function () {
    openidClient = createOpenIdClientMock();
    sinon.stub(logger, 'info');
  });

  describe('discovery', function () {
    context('when the first call is successful', function () {
      it('returns the result', async function () {
        // given
        const someParams = {};
        const someResult = Symbol('someResult');
        openidClient.discovery.resolves(someResult);
        const openidClientWithRetry = new OpenidClientWithRetry({ openidClient, durationInMs });

        // when
        const result = await openidClientWithRetry.discovery(someParams);

        // then
        expect(openidClient.discovery).to.have.been.calledOnce;
        expect(result).to.equal(someResult);
      });
    });

    context('when the call fails once', function () {
      it('retry once', async function () {
        // given
        const someParams = {};
        const someResult = Symbol('someResult');
        openidClient.discovery.onFirstCall().rejects(new Error()).onSecondCall().resolves(someResult);
        const openidClientWithRetry = new OpenidClientWithRetry({ openidClient, durationInMs });

        // when
        const result = await openidClientWithRetry.discovery(someParams);

        // then
        expect(openidClient.discovery).to.have.been.calledTwice;
        expect(logger.info).to.have.been.calledOnce;
        expect(result).to.equal(someResult);
      });
    });

    context('when maxRetryCount is reached', function () {
      it('does not retry anymore and throws the error', async function () {
        // given
        const someParams = {};
        openidClient.discovery.rejects(new Error());
        const openidClientWithRetry = new OpenidClientWithRetry({ openidClient, durationInMs });

        // when
        try {
          await openidClientWithRetry.discovery(someParams);
          // eslint-disable-next-line no-unused-vars
        } catch (_) {
          // continue regardless of error
        }

        // then
        expect(openidClient.discovery.callCount).to.equal(11);
        expect(logger.info.callCount).to.equal(10);
      });
    });
  });

  describe('authorizationCodeGrant', function () {
    context('when the first call is successful', function () {
      it('returns the result', async function () {
        // given
        const someParams = {};
        const someResult = Symbol('someResult');
        openidClient.authorizationCodeGrant.resolves(someResult);
        const openidClientWithRetry = new OpenidClientWithRetry({ openidClient, durationInMs });

        // when
        const result = await openidClientWithRetry.authorizationCodeGrant(someParams);

        // then
        expect(openidClient.authorizationCodeGrant).to.have.been.calledOnce;
        expect(result).to.equal(someResult);
      });
    });

    context('when the call fails once', function () {
      it('retry once', async function () {
        // given
        const someParams = {};
        const someResult = Symbol('someResult');
        openidClient.authorizationCodeGrant.onFirstCall().rejects(new Error()).onSecondCall().resolves(someResult);
        const openidClientWithRetry = new OpenidClientWithRetry({ openidClient, durationInMs });

        // when
        const result = await openidClientWithRetry.authorizationCodeGrant(someParams);

        // then
        expect(openidClient.authorizationCodeGrant).to.have.been.calledTwice;
        expect(logger.info).to.have.been.calledOnce;
        expect(result).to.equal(someResult);
      });
    });

    context('when maxRetryCount is reached', function () {
      it('does not retry anymore and throws the error', async function () {
        // given
        const someParams = {};
        openidClient.authorizationCodeGrant.rejects(new Error());
        const openidClientWithRetry = new OpenidClientWithRetry({ openidClient, durationInMs });

        // when
        try {
          await openidClientWithRetry.authorizationCodeGrant(someParams);
          // eslint-disable-next-line no-unused-vars
        } catch (_) {
          // continue regardless of error
        }

        // then
        expect(openidClient.authorizationCodeGrant.callCount).to.equal(11);
        expect(logger.info.callCount).to.equal(10);
      });
    });
  });

  describe('fetchUserInfo', function () {
    context('when the first call is successful', function () {
      it('returns the result', async function () {
        // given
        const someParams = {};
        const someResult = Symbol('someResult');
        openidClient.fetchUserInfo.resolves(someResult);
        const openidClientWithRetry = new OpenidClientWithRetry({ openidClient, durationInMs });

        // when
        const result = await openidClientWithRetry.fetchUserInfo(someParams);

        // then
        expect(openidClient.fetchUserInfo).to.have.been.calledOnce;
        expect(result).to.equal(someResult);
      });
    });

    context('when the call fails once', function () {
      it('retry once', async function () {
        // given
        const someParams = {};
        const someResult = Symbol('someResult');
        openidClient.fetchUserInfo.onFirstCall().rejects(new Error()).onSecondCall().resolves(someResult);
        const openidClientWithRetry = new OpenidClientWithRetry({ openidClient, durationInMs });

        // when
        const result = await openidClientWithRetry.fetchUserInfo(someParams);

        // then
        expect(openidClient.fetchUserInfo).to.have.been.calledTwice;
        expect(logger.info).to.have.been.calledOnce;
        expect(result).to.equal(someResult);
      });
    });

    context('when maxRetryCount is reached', function () {
      it('does not retry anymore and throws the error', async function () {
        // given
        const someParams = {};
        openidClient.fetchUserInfo.rejects(new Error());
        const openidClientWithRetry = new OpenidClientWithRetry({ openidClient, durationInMs });

        // when
        try {
          await openidClientWithRetry.fetchUserInfo(someParams);
          // eslint-disable-next-line no-unused-vars
        } catch (_) {
          // continue regardless of error
        }

        // then
        expect(openidClient.fetchUserInfo.callCount).to.equal(11);
        expect(logger.info.callCount).to.equal(10);
      });
    });
  });

  describe('buildAuthorizationUrl', function () {
    it('just proxies the call', async function () {
      // given
      const someParams = {};
      const someResult = Symbol('someResult');
      openidClient.buildAuthorizationUrl.returns(someResult);
      const openidClientWithRetry = new OpenidClientWithRetry({ openidClient, durationInMs });

      // when
      const result = openidClientWithRetry.buildAuthorizationUrl(someParams);

      // then
      expect(openidClient.buildAuthorizationUrl).to.have.been.calledOnce;
      expect(result).to.equal(someResult);
    });
  });

  describe('buildEndSessionUrl', function () {
    it('just proxies the call', async function () {
      // given
      const someParams = {};
      const someResult = Symbol('someResult');
      openidClient.buildEndSessionUrl.returns(someResult);
      const openidClientWithRetry = new OpenidClientWithRetry({ openidClient, durationInMs });

      // when
      const result = openidClientWithRetry.buildEndSessionUrl(someParams);

      // then
      expect(openidClient.buildEndSessionUrl).to.have.been.calledOnce;
      expect(result).to.equal(someResult);
    });
  });
});
