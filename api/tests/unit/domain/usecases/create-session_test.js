import { expect, sinon, catchErr } from '../../../test-helper.js';
import lodash/noop from 'lodash/noop';

const {
  noop
} = lodash/noop;

import { createSession } from '../../../../lib/domain/usecases/create-session.js';
import { ForbiddenAccess } from '../../../../lib/domain/errors.js';
import { Session } from '../../../../lib/domain/models/Session.js';

describe('Unit | UseCase | create-session', function () {
  describe('#save', function () {
    const userId = 'userId';
    const certificationCenterId = 'certificationCenterId';
    const certificationCenterName = 'certificationCenterName';
    const certificationCenter = { id: certificationCenterId, name: certificationCenterName };
    const sessionToSave = { certificationCenterId };
    const certificationCenterRepository = { get: noop };
    const sessionRepository = { save: noop };
    const userRepository = { getWithCertificationCenterMemberships: noop };
    const userWithMemberships = { hasAccessToCertificationCenter: noop };

    context('when session is not valid', function () {
      it('should throw an error', function () {
        // given
        const sessionValidatorStub = { validate: sinon.stub().throws() };

        // when
        const promise = createSession({
          userId,
          session: sessionToSave,
          certificationCenterRepository,
          sessionRepository,
          userRepository,
          dependencies: { sessionValidator: sessionValidatorStub },
        });

        // then
        expect(promise).to.be.rejected;
        expect(sessionValidatorStub.validate).to.have.been.calledWithExactly(sessionToSave);
      });
    });

    context('when session is valid', function () {
      context('when user has no certification center membership', function () {
        it('should throw a Forbidden error', async function () {
          // given
          userWithMemberships.hasAccessToCertificationCenter = sinon.stub();
          userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(false);
          userRepository.getWithCertificationCenterMemberships = sinon.stub();
          userRepository.getWithCertificationCenterMemberships.withArgs(userId).returns(userWithMemberships);
          const sessionValidatorStub = { validate: sinon.stub().returns() };
          const sessionCodeServiceStub = { getNewSessionCode: sinon.stub() };

          // when
          const error = await catchErr(createSession)({
            userId,
            session: sessionToSave,
            certificationCenterRepository,
            sessionRepository,
            userRepository,
            dependencies: { sessionValidator: sessionValidatorStub, sessionCodeService: sessionCodeServiceStub },
          });

          // then
          expect(error).to.be.instanceOf(ForbiddenAccess);
        });
      });

      context('when user has certification center membership', function () {
        it('should save the session with appropriate arguments', async function () {
          // given
          const accessCode = Symbol('accessCode');
          const sessionValidatorStub = { validate: sinon.stub().returns() };
          const sessionCodeServiceStub = { getNewSessionCode: sinon.stub().returns(accessCode) };
          userWithMemberships.hasAccessToCertificationCenter = sinon.stub();
          userRepository.getWithCertificationCenterMemberships = sinon.stub();
          certificationCenterRepository.get = sinon.stub();

          sessionRepository.save = sinon.stub();
          userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(true);
          userRepository.getWithCertificationCenterMemberships.withArgs(userId).returns(userWithMemberships);
          certificationCenterRepository.get.withArgs(certificationCenterId).resolves(certificationCenter);
          sessionRepository.save.resolves();

          // when
          await createSession({
            userId,
            session: sessionToSave,
            certificationCenterRepository,
            sessionRepository,
            userRepository,
            dependencies: { sessionValidator: sessionValidatorStub, sessionCodeService: sessionCodeServiceStub },
          });

          // then
          const expectedSession = new Session({
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
          });

          expect(sessionRepository.save).to.have.been.calledWithExactly(expectedSession);
        });
      });
    });
  });
});
