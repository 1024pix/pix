import { expect, sinon } from '../../../../../test-helper.js';
import { updateSession } from '../../../../../../src/certification/session/domain/usecases/update-session.js';

describe('Unit | UseCase | update-session', function () {
  let originalSession;
  let sessionRepository;
  let sessionValidator;

  const certificationCenterId = 1;

  beforeEach(function () {
    originalSession = {
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
    };
    sessionRepository = {
      get: sinon.stub(),
      updateSessionInfo: sinon.stub(),
    };
    sessionRepository.get.withArgs(originalSession.id).resolves(originalSession);
    sessionRepository.updateSessionInfo.callsFake((updatedSession) => updatedSession);
    sessionValidator = { validate: sinon.stub() };
    sessionValidator.validate.withArgs(originalSession).returns();
  });

  context('when session exists', function () {
    it('should update the session address only', function () {
      // given
      const updatedSession = {
        id: 1,
        certificationCenter: 'Université de gastronomie Paul',
        certificationCenterId: certificationCenterId,
        address: 'NEW ADDRESS',
        room: '28D',
        examiner: 'Joel R',
        date: '2017-12-08',
        time: '14:30',
        description: 'miam',
        accessCode: 'ABCD12',
      };

      // when
      const promise = updateSession({
        session: updatedSession,
        sessionRepository,
        sessionValidator,
      });

      // then
      return promise.then((resultSession) => {
        expect(sessionRepository.updateSessionInfo).to.have.been.calledWithExactly(updatedSession);
        expect(resultSession.address).to.equal(updatedSession.address);
      });
    });

    it('should update the session address and examiner only', function () {
      // given
      const updatedSession = {
        id: 1,
        certificationCenter: 'Université de gastronomie Paul',
        certificationCenterId: certificationCenterId,
        address: 'NEW ADRESS',
        room: '28D',
        examiner: 'NEW EXAMINER',
        date: '2017-12-08',
        time: '14:30',
        description: 'miam',
        accessCode: 'ABCD12',
      };

      // when
      const promise = updateSession({
        session: updatedSession,
        sessionRepository,
        sessionValidator,
      });

      // then
      return promise.then((resultSession) => {
        expect(sessionRepository.updateSessionInfo).to.have.been.calledWithExactly(updatedSession);
        expect(resultSession.address).to.equal(updatedSession.address);
      });
    });
  });

  context('when an error occurred', function () {
    it('should throw an error when the session could not be retrieved', function () {
      // given
      sessionRepository.get.withArgs(originalSession.id).rejects();

      // when
      const promise = updateSession({
        session: originalSession,
        sessionRepository: sessionRepository,
        sessionValidator,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the payload is invalid', function () {
      // given
      sessionValidator.validate.withArgs(originalSession).throws();

      // when
      const promise = updateSession({
        session: originalSession,
        sessionRepository,
        sessionValidator,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the session could not be updated', function () {
      // given
      sessionRepository.updateSessionInfo.withArgs(originalSession).rejects();

      // when
      const promise = updateSession({
        session: originalSession,
        sessionRepository,
        sessionValidator,
      });

      // then
      return expect(promise).to.be.rejected;
    });
  });
});
