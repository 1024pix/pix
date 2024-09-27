import { SessionEnrolment } from '../../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import { createSession } from '../../../../../../src/certification/enrolment/domain/usecases/create-session.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | create-session', function () {
  let centerRepository;
  let sessionRepository;
  let userWithMemberships;
  const userId = 'userId';
  const certificationCenterId = 123;
  const certificationCenterName = 'certificationCenterName';
  const sessionToSave = { certificationCenterId };

  beforeEach(function () {
    centerRepository = { getById: sinon.stub() };
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
          centerRepository,
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
        centerRepository.getById = sinon.stub();
        sessionRepository.save = sinon.stub();
        userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(true);
        sessionRepository.save.resolves();
      });

      it('should save the session with appropriate arguments', async function () {
        // given
        const center = domainBuilder.certification.enrolment.buildCenter({
          id: certificationCenterId,
          name: certificationCenterName,
        });

        centerRepository.getById.withArgs({ id: certificationCenterId }).resolves(center);

        // when
        await createSession({
          userId,
          session: sessionToSave,
          centerRepository,
          sessionRepository,
          sessionValidator: sessionValidatorStub,
          sessionCodeService: sessionCodeServiceStub,
        });

        // then
        const expectedSession = new SessionEnrolment({
          certificationCenterId,
          certificationCenter: certificationCenterName,
          accessCode,
          invigilatorPassword: sinon.match.string,
          version: 2,
          createdBy: userId,
          certificationCandidates: [],
        });

        expect(sessionRepository.save).to.have.been.calledWithExactly({ session: expectedSession });
      });

      context('when session is created by a V3 pilot certification center', function () {
        it('should save the session with appropriate arguments', async function () {
          // given
          const v3PilotCenter = domainBuilder.certification.enrolment.buildCenter({
            id: certificationCenterId,
            name: certificationCenterName,
            isV3Pilot: true,
          });

          centerRepository.getById.withArgs({ id: certificationCenterId }).resolves(v3PilotCenter);

          // when
          await createSession({
            userId,
            session: sessionToSave,
            centerRepository,
            sessionRepository,
            sessionValidator: sessionValidatorStub,
            sessionCodeService: sessionCodeServiceStub,
          });

          // then
          const expectedSession = new SessionEnrolment({
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            invigilatorPassword: sinon.match.string,
            version: 3,
            createdBy: userId,
            certificationCandidates: [],
          });

          expect(sessionRepository.save).to.have.been.calledWithExactly({ session: expectedSession });
        });
      });
    });
  });
});
