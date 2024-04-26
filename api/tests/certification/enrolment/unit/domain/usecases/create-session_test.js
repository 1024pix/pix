import { createSession } from '../../../../../../src/certification/enrollment/domain/usecases/create-session.js';
import { Session } from '../../../../../../src/certification/session/domain/models/Session.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | create-session', function () {
  let certificationCenterRepository;
  let sessionRepository;
  let userWithMemberships;
  const userId = 'userId';
  const certificationCenterId = 'certificationCenterId';
  const certificationCenterName = 'certificationCenterName';
  const sessionToSave = { certificationCenterId };

  beforeEach(function () {
    certificationCenterRepository = { get: sinon.stub() };
    sessionRepository = { save: sinon.stub() };
    userWithMemberships = { hasAccessToCertificationCenter: sinon.stub() };
  });

  describe('#save', function () {
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
          sessionValidator: sessionValidatorStub,
        });

        // then
        expect(promise).to.be.rejected;
        expect(sessionValidatorStub.validate).to.have.been.calledWithExactly(sessionToSave);
      });
    });

    context('when session is valid', function () {
      let accessCode;
      let sessionValidatorStub;
      let sessionCodeServiceStub;

      beforeEach(function () {
        accessCode = Symbol('accessCode');
        sessionValidatorStub = { validate: sinon.stub().returns() };
        sessionCodeServiceStub = { getNewSessionCode: sinon.stub().returns(accessCode) };
        userWithMemberships.hasAccessToCertificationCenter = sinon.stub();
        certificationCenterRepository.get = sinon.stub();
        sessionRepository.save = sinon.stub();
        userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(true);
        sessionRepository.save.resolves();
      });

      it('should save the session with appropriate arguments', async function () {
        // given
        const certificationCenter = domainBuilder.buildCertificationCenter({
          id: certificationCenterId,
          name: certificationCenterName,
        });

        certificationCenterRepository.get.withArgs({ id: certificationCenterId }).resolves(certificationCenter);

        // when
        await createSession({
          userId,
          session: sessionToSave,
          certificationCenterRepository,
          sessionRepository,
          sessionValidator: sessionValidatorStub,
          sessionCodeService: sessionCodeServiceStub,
        });

        // then
        const expectedSession = new Session({
          certificationCenterId,
          certificationCenter: certificationCenterName,
          accessCode,
          supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
          version: 2,
          createdBy: userId,
        });

        expect(sessionRepository.save).to.have.been.calledWithExactly({ session: expectedSession });
      });

      context('when session is created by a V3 pilot certification center', function () {
        it('should save the session with appropriate arguments', async function () {
          // given
          const v3PilotCertificationCenter = domainBuilder.buildCertificationCenter({
            id: certificationCenterId,
            name: certificationCenterName,
            isV3Pilot: true,
          });

          certificationCenterRepository.get
            .withArgs({ id: certificationCenterId })
            .resolves(v3PilotCertificationCenter);

          // when
          await createSession({
            userId,
            session: sessionToSave,
            certificationCenterRepository,
            sessionRepository,
            sessionValidator: sessionValidatorStub,
            sessionCodeService: sessionCodeServiceStub,
          });

          // then
          const expectedSession = new Session({
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
            version: 3,
            createdBy: userId,
          });

          expect(sessionRepository.save).to.have.been.calledWithExactly({ session: expectedSession });
        });
      });
    });
  });
});
