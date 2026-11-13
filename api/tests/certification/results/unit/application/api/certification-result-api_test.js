import { expect } from 'chai';
import sinon from 'sinon';

import * as certificationResultApi from '../../../../../../src/certification/results/application/api/certification-result-api.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Results | Unit | application | api | certif results', function () {
  describe('#buildForSession', function () {
    let sessionId,
      newCertificationResultRepository,
      certificationResultBuilderRepository,
      uuidGenerator,
      fakeCertificationResultBuilder,
      featureToggles,
      logErrorSpy,
      dependencies,
      now;

    beforeEach(function () {
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
      sessionId = 7402;
      uuidGenerator = () => '00000000-0000-4000-8000-000000000001';
      newCertificationResultRepository = {
        save: sinon.stub(),
      };
      certificationResultBuilderRepository = {
        findBuilderForCertificationsInSession: sinon.stub(),
      };
      fakeCertificationResultBuilder = { build: sinon.stub() };
      featureToggles = { get: sinon.stub() };
      preventStubsToBeCalledUnexpectedly([
        newCertificationResultRepository.save,
        certificationResultBuilderRepository.findBuilderForCertificationsInSession,
        fakeCertificationResultBuilder.build,
        featureToggles.get,
      ]);
      certificationResultBuilderRepository.findBuilderForCertificationsInSession
        .withArgs(sessionId)
        .resolves(fakeCertificationResultBuilder);
      newCertificationResultRepository.save.resolves();
      now = new Date('2024-11-23');
      sinon.useFakeTimers({ now, toFake: ['Date'] });
      dependencies = {
        sessionId,
        newCertificationResultRepository,
        certificationResultBuilderRepository,
        featureToggles,
        uuidGenerator,
      };
      logErrorSpy = sinon.spy(logger, 'error');
    });

    context('when FT writeNewCertificationResults is disabled', function () {
      it('does nothing', async function () {
        featureToggles.get.withArgs('writeNewCertificationResults').resolves(false);

        await certificationResultApi.buildForSession({
          sessionId,
          dependencies,
        });

        sinon.assert.notCalled(newCertificationResultRepository.save);
      });
    });

    context('when FT writeNewCertificationResults is enabled', function () {
      beforeEach(function () {
        featureToggles.get.withArgs('writeNewCertificationResults').resolves(true);
      });

      context('when some errors occur when building the certification results', function () {
        it('logs the errors but save the successful built ones anyway', async function () {
          const certificationResults = Symbol('certificationResults');
          const userCertificationResults = Symbol('userCertificationResults');
          fakeCertificationResultBuilder.build.withArgs(uuidGenerator).returns({
            certificationResults,
            userCertificationResults,
            errors: { 123: 'I walked in poo', 456: 'My dog ate my assignment' },
          });

          await certificationResultApi.buildForSession({
            sessionId,
            dependencies,
          });

          expect(logErrorSpy).to.have.been.calledWith(
            'Errors encountered when generating certification results: {"123":"I walked in poo","456":"My dog ate my assignment"}',
          );
          expect(newCertificationResultRepository.save).to.have.been.calledOnceWithExactly({
            certificationResults,
            userCertificationResults,
          });
        });
      });

      context('when no error occurs when building the certification results', function () {
        it('logs nothing and save the successful built ones anyway', async function () {
          const certificationResults = Symbol('certificationResults');
          const userCertificationResults = Symbol('userCertificationResults');
          fakeCertificationResultBuilder.build.withArgs(uuidGenerator).returns({
            certificationResults,
            userCertificationResults,
            errors: {},
          });

          await certificationResultApi.buildForSession({
            sessionId,
            dependencies,
          });

          sinon.assert.notCalled(logErrorSpy);
          expect(newCertificationResultRepository.save).to.have.been.calledOnceWithExactly({
            certificationResults,
            userCertificationResults,
          });
        });
      });
    });
  });
});
