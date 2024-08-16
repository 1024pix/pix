import { updateSession } from '../../../../../../src/certification/enrolment/domain/usecases/update-session.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | update-session', function () {
  let originalSession;
  let sessionRepository;
  let sessionValidator;

  const certificationCenterId = 1;

  beforeEach(function () {
    sessionRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
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
    sessionValidator = { validate: sinon.stub() };
    sessionValidator.validate.withArgs(originalSession).returns();
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
