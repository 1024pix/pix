const { expect, sinon, testErr, testDomainNotFoundErr } = require('../../../test-helper');
const sessionService = require('../../../../lib/domain/services/session-service');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const { NotFoundError } = require('../../../../lib/domain/errors');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');
const certificationCenterRepository = require('../../../../lib/infrastructure/repositories/certification-center-repository');

describe('Unit | Service | session', () => {

  describe('#sessionExists', () => {

    beforeEach(() => {
      sinon.stub(sessionCodeService, 'getSessionByAccessCode');
    });

    context('when access-code is not given', () => {
      it('should stop the request', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves(null);

        // when
        const promise = sessionService.sessionExists(null);

        // then
        return promise.catch((result) => {
          expect(result).to.be.an.instanceOf(NotFoundError);
        });
      });
    });

    context('when access-code is wrong', () => {
      it('should stop the request', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves(null);

        // when
        const promise = sessionService.sessionExists('1234');

        // then
        return promise.catch((result) => {
          expect(result).to.be.an.instanceOf(NotFoundError);
        });
      });
    });

    context('when access-code is correct', () => {
      it('should let the request continue', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves({ id: 12 });

        // when
        const promise = sessionService.sessionExists('ABCD12');

        // then
        return promise.then((result) => {
          expect(result).to.be.equal(12);
        });
      });
    });
  });

  describe('#get', () => {

    it('should get session informations with related certifications', () => {
      // given
      const sessionId = 'sessionId';
      sinon.stub(sessionRepository, 'get').resolves();

      // when
      const promise = sessionService.get(sessionId);

      // then
      return promise.then(() => {
        expect(sessionRepository.get).to.have.been.calledWith('sessionId');
      });
    });
  });

  describe('#save', () => {
    let certificationCenter, certificationCenterName, sessionModel, certificationCenterId, sessionId, sessionModelAugmented,
      getCertificationCenterStub, saveSessionStub;
    beforeEach(() => {
      sessionId = 'session id';
      certificationCenterId = 'certification center id';
      certificationCenterName = 'certification center name';
      certificationCenter = { id: certificationCenterId, name: certificationCenterName };
      sessionModel = { id: sessionId, certificationCenterId };
      sessionModelAugmented = { id: sessionId, certificationCenterId, certificationCenter: certificationCenterName };
      getCertificationCenterStub = sinon.stub(certificationCenterRepository, 'get');
      saveSessionStub = sinon.stub(sessionRepository, 'save');
    });
    context('the certification center is supposed to exist', () => {
      context('the certification center was retrieved', () => {
        context('the certification center exists', () => {
          context('the session was saved', () => {
            it('should have fetched the certification center and saved an augmented session', async () => {
              // given
              getCertificationCenterStub.resolves(certificationCenter);
              saveSessionStub.resolves();

              // when
              await sessionService.save(sessionModel);

              // then
              expect(sessionModel).to.deep.equal(sessionModelAugmented);
              expect(certificationCenterRepository.get).to.have.been.calledWithExactly(certificationCenterId);
              expect(sessionRepository.save).to.have.been.calledWithExactly(sessionModelAugmented);
            });
          });
          context('the session could not be saved', () => {
            it('should forward the error', async () => {
              // given
              getCertificationCenterStub.resolves(certificationCenter);
              saveSessionStub.rejects(testErr);

              // when
              const promise = sessionService.save(sessionModel);

              // then
              return promise.catch((err) => {
                expect(err).to.deep.equal(testErr);
              });
            });
          });
        });
        context('the certification center does not exist', () => {
          it('should save the session as it is', async () => {
            // given
            getCertificationCenterStub.rejects(testDomainNotFoundErr);
            saveSessionStub.resolves();

            // when
            await sessionService.save(sessionModel);

            // then
            expect(sessionRepository.save).to.have.been.calledWithExactly(sessionModel);
          });
        });
      });
      context('the certification center could not be retrieved', () => {
        it('should forward the error', () => {
          // given
          getCertificationCenterStub.rejects(testErr);
          saveSessionStub.resolves();

          // when
          const promise = sessionService.save(sessionModel);

          // then
          return promise.catch((err) => {
            expect(err).to.deep.equal(testErr);
          });
        });
      });
    });
    context('the certification center is not supposed to exist', () => {
      it('should save the session without attempting to link it to any certification center', async () => {
        // given
        sessionModel.certificationCenterId = null;
        saveSessionStub.resolves();

        // when
        await sessionService.save(sessionModel);

        // then
        expect(sessionRepository.save).to.have.been.calledWithExactly(sessionModel);
      });
    });

  });

});
