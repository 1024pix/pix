const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const assignCertificationOfficerToJurySession = require('../../../../lib/domain/usecases/assign-certification-officer-to-jury-session');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | assign-certification-officer-to-session', () => {
  context('when session id is not a number', () => {
    it('should throw a NotFound error', async () => {
      // given
      const jurySessionRepository = {
        assignCertificationOfficer: sinon.stub(),
      };
      const sessionId = 'notANumber';
      const certificationOfficerId = 1;

      // when
      const error = await catchErr(assignCertificationOfficerToJurySession)({
        sessionId,
        certificationOfficerId,
        jurySessionRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ObjectValidationError);
    });
  });

  context('when session id is a number', () => {
    context('when certificationOfficerId is not a number', () => {
      it('should throw a NotFound error', async () => {
        // given
        const jurySessionRepository = {
          assignCertificationOfficer: sinon.stub(),
        };
        const sessionId = 1;
        const certificationOfficerId = 'notANumber';

        // when
        const error = await catchErr(assignCertificationOfficerToJurySession)({
          sessionId,
          certificationOfficerId,
          jurySessionRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(ObjectValidationError);
      });
    });

    context('when certificationOfficerId is a number', () => {
      it('should return the session id after assigningUser to it', async () => {
        // given
        const returnedSessionId = Symbol('returnedSessionId');
        const sessionId = 1;
        const certificationOfficerId = 2;

        const jurySessionRepository = {
          assignCertificationOfficer: sinon.stub(),
        };
        jurySessionRepository.assignCertificationOfficer
          .resolves(returnedSessionId);

        const finalizedSessionRepository = {
          get: sinon.stub(),
          save: sinon.stub(),
        };

        const finalizedSession = domainBuilder.buildFinalizedSession();

        finalizedSessionRepository.get
          .withArgs({ sessionId })
          .resolves(finalizedSession);

        const certificationOfficerRepository = { get: sinon.stub() };
        const certificationOfficer = domainBuilder.buildCertificationOfficer();
        certificationOfficerRepository.get
          .withArgs(2)
          .resolves(certificationOfficer);

        // when
        const actualSessionId = await assignCertificationOfficerToJurySession({
          sessionId,
          certificationOfficerId,
          jurySessionRepository,
          finalizedSessionRepository,
          certificationOfficerRepository,
        });

        // then
        expect(
          jurySessionRepository.assignCertificationOfficer,
        ).to.have.been.calledWith({
          id: finalizedSession.sessionId,
          assignedCertificationOfficerId: certificationOfficer.id,
        });
        expect(
          finalizedSessionRepository.save,
        ).to.have.been.calledWith(finalizedSession);
        expect(actualSessionId).to.equal(returnedSessionId);
      });
    });
  });
});
