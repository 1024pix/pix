const { expect, sinon, catchErr } = require('../../../test-helper');
const assignCertificationOfficerToSession = require('../../../../lib/domain/usecases/assign-certification-officer-to-session');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | assign-certification-officer-to-session', () => {
  let sessionId;
  let certificationOfficerId;
  let jurySessionRepository;

  beforeEach(() => {
    jurySessionRepository = { assignCertificationOfficer: sinon.stub() };
  });

  context('when session id is not a number', () => {

    it('should throw a NotFound error', async () => {
      // given
      sessionId = 'notANumber';

      // when
      const error = await catchErr(assignCertificationOfficerToSession)({ sessionId, certificationOfficerId, jurySessionRepository });

      // then
      expect(error).to.be.an.instanceOf(ObjectValidationError);
    });
  });

  context('when session id is a number', () => {

    beforeEach(() => {
      sessionId = 1;
    });

    context('when certificationOfficerId is not a number', () => {

      it('should throw a NotFound error', async () => {
        // given
        certificationOfficerId = 'notANumber';

        // when
        const error = await catchErr(assignCertificationOfficerToSession)({ sessionId, certificationOfficerId, jurySessionRepository });

        // then
        expect(error).to.be.an.instanceOf(ObjectValidationError);
      });
    });

    context('when certificationOfficerId is a number', () => {
      const returnedSession = Symbol('returnedSession');

      beforeEach(() => {
        certificationOfficerId = 2;
        jurySessionRepository.assignCertificationOfficer.withArgs({ id: sessionId, assignedCertificationOfficerId: certificationOfficerId }).resolves(returnedSession);
      });

      it('should return the session after assigningUser to it', async () => {
        // when
        const actualSession = await assignCertificationOfficerToSession({ sessionId, certificationOfficerId, jurySessionRepository });

        // then
        expect(jurySessionRepository.assignCertificationOfficer).to.have.been.calledWith({ id: sessionId, assignedCertificationOfficerId: certificationOfficerId });
        expect(actualSession).to.equal(returnedSession);
      });
    });
  });
});
