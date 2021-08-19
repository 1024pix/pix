const { expect, sinon, catchErr } = require('../../../test-helper');

const createSession = require('../../../../lib/domain/usecases/create-session');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const sessionValidator = require('../../../../lib/domain/validators/session-validator');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-session', function() {

  describe('#save', function() {
    const userId = 'userId';
    const certificationCenterId = 'certificationCenterId';
    const certificationCenterName = 'certificationCenterName';
    const certificationCenter = { id: certificationCenterId, name: certificationCenterName };
    const sessionToSave = { certificationCenterId };
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const certificationCenterRepository = { get: sinon.stub() };
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const sessionRepository = { save: sinon.stub() };
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const userRepository = { getWithCertificationCenterMemberships: sinon.stub() };
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const userWithMemberships = { hasAccessToCertificationCenter: sinon.stub() };
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const accessCode = Symbol('accessCode');

    context('when session is not valid', function() {

      beforeEach(function() {
        sinon.stub(sessionValidator, 'validate').throws();
      });

      it('should throw an error', function() {
        const promise = createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

        // then
        expect(promise).to.be.rejected;
        expect(sessionValidator.validate.calledWithExactly(sessionToSave));
      });
    });

    context('when session is valid', function() {

      beforeEach(function() {
        sinon.stub(sessionValidator, 'validate').returns();
      });

      context('when user has no certification center membership', function() {

        beforeEach(function() {
          userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(false);
          userRepository.getWithCertificationCenterMemberships.withArgs(userId).returns(userWithMemberships);
        });

        it('should throw a Forbidden error', async function() {
          // when
          const error = await catchErr(createSession)({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

          // then
          expect(error).to.be.instanceOf(ForbiddenAccess);
        });
      });

      context('when user has certification center membership', function() {

        beforeEach(function() {
          userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(true);
          userRepository.getWithCertificationCenterMemberships.withArgs(userId).returns(userWithMemberships);
          sinon.stub(sessionCodeService, 'getNewSessionCode').resolves(accessCode);
          certificationCenterRepository.get.withArgs(certificationCenterId).resolves(certificationCenter);
          sessionRepository.save.resolves();
        });

        it('should save the session with appropriate arguments', async function() {
          // when
          await createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

          // then
          expect(sessionRepository.save.calledWithExactly({ certificationCenterId, certificationCenter: certificationCenterName, accessCode })).to.be.true;
        });
      });
    });
  });

});
