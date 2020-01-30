const { expect, sinon, catchErr } = require('../../../test-helper');

const createSession = require('../../../../lib/domain/usecases/create-session');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const sessionValidator = require('../../../../lib/domain/validators/session-validator');
const { statuses } = require('../../../../lib/domain/models/Session');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-session', () => {

  describe('#save', () => {
    const userId = 'userId';
    const certificationCenterId = 'certificationCenterId';
    const certificationCenterName = 'certificationCenterName';
    const certificationCenter = { id: certificationCenterId, name: certificationCenterName };
    const sessionToSave = { certificationCenterId };
    const certificationCenterRepository = { get: sinon.stub() };
    const sessionRepository = { save: sinon.stub() };
    const userRepository = { getWithCertificationCenterMemberships: sinon.stub() };
    const userWithMemberships = { hasAccessToCertificationCenter: sinon.stub() };
    const accessCode = Symbol('accessCode');

    context('when session is not valid', () => {

      beforeEach(() => {
        sinon.stub(sessionValidator, 'validate').throws();
      });

      it('should throw an error', () => {
        const promise = createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

        // then
        expect(promise).to.be.rejected;
        expect(sessionValidator.validate.calledWithExactly(sessionToSave));
      });
    });

    context('when session is valid', () => {

      beforeEach(() => {
        sinon.stub(sessionValidator, 'validate').returns();
      });

      context('when user has no certification center membership', () => {

        beforeEach(() => {
          userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(false);
          userRepository.getWithCertificationCenterMemberships.withArgs(userId).returns(userWithMemberships);
        });

        it('should throw an Forbidden error', async () => {
          // when
          const error = await catchErr(createSession)({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

          // then
          expect(error).to.be.instanceOf(ForbiddenAccess);
        });
      });

      context('when user has certification center membership', () => {

        beforeEach(() => {
          userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(true);
          userRepository.getWithCertificationCenterMemberships.withArgs(userId).returns(userWithMemberships);
          sinon.stub(sessionCodeService, 'getNewSessionCode').resolves(accessCode);
          certificationCenterRepository.get.withArgs(certificationCenterId).resolves(certificationCenter);
          sessionRepository.save.resolves();
        });

        it('should save the session with appropriate arguments', async () => {
          // when
          await createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

          // then
          expect(sessionRepository.save.calledWithExactly({ certificationCenterId, certificationCenter: certificationCenterName, accessCode, status: statuses.STARTED })).to.be.true;
        });
      });
    });
  });

});
