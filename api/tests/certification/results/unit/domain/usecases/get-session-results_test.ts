import { expect } from 'chai';
import sinon from 'sinon';

import { SessionAuthorization } from '../../../../../../src/certification/results/domain/models/SessionAuthorization.js';
import { getSessionResults } from '../../../../../../src/certification/results/domain/usecases/get-session-results.ts';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { sessionStatusBuilder } from '../../../../../tooling/domain-builder/factory/certification/shared/build-session-status.js';
import { catchErr, preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Results | Unit | Domain | UseCases | get-session-results', function () {
  let sessionAuthorizationAdapter: { find: sinon.SinonStub };
  let certificationResultForCsvRepository: { findBySession: sinon.SinonStub };
  let sessionForResultsSharingRepository: { get: sinon.SinonStub };
  let dependencies: {
    sessionAuthorizationAdapter: typeof sessionAuthorizationAdapter;
    certificationResultForCsvRepository: typeof certificationResultForCsvRepository;
    sessionForResultsSharingRepository: typeof sessionForResultsSharingRepository;
  };
  const sessionId = 123;

  beforeEach(function () {
    sessionAuthorizationAdapter = {
      find: sinon.stub(),
    };
    certificationResultForCsvRepository = {
      findBySession: sinon.stub(),
    };
    sessionForResultsSharingRepository = {
      get: sinon.stub(),
    };

    preventStubsToBeCalledUnexpectedly([
      sessionAuthorizationAdapter.find,
      certificationResultForCsvRepository.findBySession,
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
      const err = await catchErr(getSessionResults)({
        sessionId,
        ...dependencies,
      });

      // then
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });

  describe('when the results cannot be fetched because of session state', function () {
    it('should throw an error', async function () {
      // given
      const sessionStatus = sessionStatusBuilder().created().build();
      const sessionAuthorization = new SessionAuthorization({ id: sessionId, sessionStatus });
      sessionAuthorizationAdapter.find.withArgs({ sessionId }).resolves(sessionAuthorization);

      // when
      const err = await catchErr(getSessionResults)({
        sessionId,
        ...dependencies,
      });

      // then
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });

  describe('when can fetch the results', function () {
    beforeEach(function () {
      const sessionStatus = sessionStatusBuilder().processed().build();
      const sessionAuthorization = new SessionAuthorization({ id: sessionId, sessionStatus });
      sessionAuthorizationAdapter.find.withArgs({ sessionId }).resolves(sessionAuthorization);
    });

    describe('when no results found', function () {
      it('throws a NotFound error', async function () {
        // given
        certificationResultForCsvRepository.findBySession.withArgs({ sessionId }).resolves([]);

        // when
        const err = await catchErr(getSessionResults)({
          sessionId,
          ...dependencies,
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
        certificationResultForCsvRepository.findBySession
          .withArgs({ sessionId })
          .resolves([certifResult1, certifResult2]);
        sessionForResultsSharingRepository.get.withArgs(sessionId).resolves(expectedSessionInfo);

        // when
        const { certificationResults, sessionInfo } = await getSessionResults({
          sessionId,
          ...dependencies,
        });

        // then
        expect(certificationResults).to.deep.equal([certifResult1, certifResult2]);
        expect(sessionInfo).to.equal(expectedSessionInfo);
      });
    });
  });
});
