const { expect, sinon, catchErr } = require('../../../test-helper');
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
          assignCertificationOfficer: sinon.stub(),
        };

        const userRepository = { get: sinon.stub() };
        userRepository.get
          .withArgs(2)
          .resolves({ firstName: 'Severus', lastName: 'Snape' });

        // when
        const actualSessionId = await assignCertificationOfficerToJurySession({
          sessionId,
          certificationOfficerId,
          jurySessionRepository,
          finalizedSessionRepository,
          userRepository,
        });

        // then
        expect(
          jurySessionRepository.assignCertificationOfficer,
        ).to.have.been.calledWith({
          id: sessionId,
          assignedCertificationOfficerId: certificationOfficerId,
        });
        expect(
          finalizedSessionRepository.assignCertificationOfficer,
        ).to.have.been.calledWith({
          id: 1,
          assignedCertificationOfficerName: 'Severus Snape',
        });
        expect(actualSessionId).to.equal(returnedSessionId);
      });
    });
  });
});
