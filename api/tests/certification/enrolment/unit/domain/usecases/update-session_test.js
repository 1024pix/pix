import sinon from 'sinon';

import { updateSession } from '../../../../../../src/certification/enrolment/domain/usecases/update-session.js';
import { AlreadyExistingEntityError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | update-session', function () {
  let originalSession;
  let sessionRepository;
  let sessionValidator;

  const certificationCenterId = 1;

  beforeEach(function () {
    sessionRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
      isSessionExistingByCertificationCenterId: sinon.stub(),
    };
    originalSession = domainBuilder.certification.enrolment.buildSession({
      id: 1,
      certificationCenter: 'Université de gastronomie Paul',
      certificationCenterId: certificationCenterId,
      address: 'Lyon',
      room: '28D',
      examiner: 'Joel R',
      date: '2017-12-08',
      time: '14:30',
      description: 'miam',
      accessCode: 'ABCD12',
    });
    sessionRepository.get.withArgs({ id: originalSession.id }).onCall(0).resolves(originalSession);
    sessionRepository.update.resolves();
    sessionRepository.isSessionExistingByCertificationCenterId.resolves(false);
    sessionValidator = { validate: sinon.stub() };
    sessionValidator.validate.withArgs(originalSession).returns();
  });

  context('when the updated session would be a duplicate of an existing session', function () {
    it('should throw an AlreadyExistingEntityError', async function () {
      // given
      const updatedSession = domainBuilder.certification.enrolment.buildSession({
        id: 1,
        certificationCenterId,
        address: 'Lyon',
        room: '28D',
        date: '2017-12-08',
        time: '10:00',
      });
      sessionValidator.validate.withArgs(updatedSession).returns();
      sessionRepository.isSessionExistingByCertificationCenterId.resolves(true);

      // when
      const error = await catchErr(updateSession)({
        session: updatedSession,
        sessionRepository,
        sessionValidator,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyExistingEntityError);
      expect(sessionRepository.isSessionExistingByCertificationCenterId).to.have.been.calledWithExactly({
        address: updatedSession.address,
        room: updatedSession.room,
        date: updatedSession.date,
        time: updatedSession.time,
        certificationCenterId,
        excludeSessionId: updatedSession.id,
      });
    });
  });

  context('when session exists', function () {
    it('should update the session address only', async function () {
      // given
      const updatedSession = domainBuilder.certification.enrolment.buildSession({
        id: 1,
        certificationCenter: 'Pas la meme donnée mais je dois être ignorée',
        certificationCenterId: certificationCenterId,
        address: 'NEW ADDRESS',
        room: '28D',
        examiner: 'Joel R',
        date: '2017-12-08',
        time: '14:30',
        description: 'miam',
        accessCode: 'ABCD12',
      });
      const toBePersistedSession = domainBuilder.certification.enrolment.buildSession({
        ...originalSession,
        address: 'NEW ADDRESS',
      });
      sessionRepository.get.withArgs({ id: originalSession.id }).onCall(1).resolves('UPDATED SESSION');

      // when
      const updatedAndPersistedSession = await updateSession({
        session: updatedSession,
        sessionRepository,
        sessionValidator,
      });

      // then
      expect(sessionRepository.update).to.have.been.calledWithExactly(toBePersistedSession);
      expect(updatedAndPersistedSession).to.equal('UPDATED SESSION');
    });
  });
});
