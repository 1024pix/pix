import sinon from 'sinon';

import { SessionEnrolment } from '../../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import { createSession } from '../../../../../../src/certification/enrolment/domain/usecases/create-session.js';
import { AlreadyExistingEntityError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | create-session', function () {
  let centerRepository;
  let sessionRepository;
  const userId = 'userId';
  const certificationCenterId = 123;
  const certificationCenterName = 'certificationCenterName';
  const sessionToSave = {
    certificationCenterId,
    address: '12 rue de Paris',
    room: 'Salle 201',
    date: '2025-05-15',
    time: '10:00',
  };

  beforeEach(function () {
    centerRepository = { getById: sinon.stub() };
    sessionRepository = {
      save: sinon.stub(),
      isSessionExistingByCertificationCenterId: sinon.stub(),
    };
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

    context('when a session with the same information already exists', function () {
      it('should throw an AlreadyExistingEntityError', async function () {
        // given
        const sessionValidatorStub = { validate: sinon.stub().returns() };
        sessionRepository.isSessionExistingByCertificationCenterId.resolves(true);

        // when
        const error = await catchErr(createSession)({
          userId,
          session: sessionToSave,
          centerRepository,
          sessionRepository,
          sessionValidator: sessionValidatorStub,
          sessionCodeService: { getNewSessionCode: sinon.stub() },
        });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
        expect(sessionRepository.isSessionExistingByCertificationCenterId).to.have.been.calledWithExactly({
          address: sessionToSave.address,
          room: sessionToSave.room,
          date: sessionToSave.date,
          time: sessionToSave.time,
          certificationCenterId,
        });
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
        centerRepository.getById = sinon.stub();
        sessionRepository.save = sinon.stub();
        sessionRepository.save.resolves();
        sessionRepository.isSessionExistingByCertificationCenterId.resolves(false);
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
          ...sessionToSave,
          certificationCenter: certificationCenterName,
          accessCode,
          invigilatorPassword: sinon.match.string,
          createdBy: userId,
          certificationCandidates: [],
        });

        expect(sessionRepository.save).to.have.been.calledWithExactly({ session: expectedSession });
      });
    });
  });
});
