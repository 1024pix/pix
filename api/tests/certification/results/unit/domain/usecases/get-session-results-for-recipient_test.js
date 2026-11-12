import { expect } from 'chai';
import sinon from 'sinon';

import { SessionAuthorization } from '../../../../../../src/certification/results/domain/models/SessionAuthorization.js';
import { getSessionResultsForRecipient } from '../../../../../../src/certification/results/domain/usecases/get-session-results-for-recipient.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr, preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Use Cases | get-session-results-for-recipient', function () {
  let sessionAuthorizationAdapter,
    certificationResultForCsvRepository,
    sessionForResultsSharingRepository,
    dependencies;
  const sessionId = 123;
  const resultRecipientEmail = 'somemail@example.net';

  beforeEach(function () {
    sessionAuthorizationAdapter = {
      find: sinon.stub(),
    };
    certificationResultForCsvRepository = {
      findBySessionAndResultRecipient: sinon.stub(),
    };
    sessionForResultsSharingRepository = {
      get: sinon.stub(),
    };

    preventStubsToBeCalledUnexpectedly([
      sessionAuthorizationAdapter.find,
      certificationResultForCsvRepository.findBySessionAndResultRecipient,
      sessionForResultsSharingRepository.get,
    ]);

    dependencies = {
      sessionAuthorizationAdapter,
      certificationResultForCsvRepository,
      sessionForResultsSharingRepository,
    };
  });

  describe('when the sessionId is not found', function () {
    it('should throw a not found error', async function () {
      // given
      sessionAuthorizationAdapter.find.withArgs({ sessionId }).resolves(null);

      // when
      const err = await catchErr(getSessionResultsForRecipient)({
        sessionId,
        resultRecipientEmail,
        dependencies,
      });

      // then
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });

  describe('when the results cannot be downloaded by the recipient', function () {
    it('should throw an error', async function () {
      // given
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().created().build();
      const sessionAuthorization = new SessionAuthorization({ id: sessionId, sessionStatus });
      sessionAuthorizationAdapter.find.withArgs({ sessionId }).resolves(sessionAuthorization);

      // when
      const err = await catchErr(getSessionResultsForRecipient)({
        sessionId,
        resultRecipientEmail,
        dependencies,
      });

      // then
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });

  describe('when recipient can download the results', function () {
    beforeEach(function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().processed().build();
      const sessionAuthorization = new SessionAuthorization({ id: sessionId, sessionStatus });
      sessionAuthorizationAdapter.find.withArgs({ sessionId }).resolves(sessionAuthorization);
    });

    describe('when no results found', function () {
      it('throws a NotFound error', async function () {
        // given
        certificationResultForCsvRepository.findBySessionAndResultRecipient
          .withArgs({ sessionId, resultRecipientEmail })
          .resolves([]);

        // when
        const err = await catchErr(getSessionResultsForRecipient)({
          sessionId,
          resultRecipientEmail,
          dependencies,
        });

        // then
        expect(err).to.be.instanceOf(NotFoundError);
      });
    });

    describe('when results found', function () {
      it('returns the results', async function () {
        // given
        const certifResult1 = Symbol('certif1');
        const certifResult2 = Symbol('certif2');
        const expectedSessionInfo = Symbol('sessioninfo');
        certificationResultForCsvRepository.findBySessionAndResultRecipient
          .withArgs({ sessionId, resultRecipientEmail })
          .resolves([certifResult1, certifResult2]);
        sessionForResultsSharingRepository.get.withArgs(sessionId).resolves(expectedSessionInfo);

        // when
        const { certificationResults, sessionInfo } = await getSessionResultsForRecipient({
          sessionId,
          resultRecipientEmail,
          dependencies,
        });

        // then
        expect(certificationResults).to.deep.equal([certifResult1, certifResult2]);
        expect(sessionInfo).to.equal(expectedSessionInfo);
      });
    });
  });
});
